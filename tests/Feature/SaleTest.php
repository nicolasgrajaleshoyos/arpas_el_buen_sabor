<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SaleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user);
    }

    public function test_can_create_sale_and_reduce_stock()
    {
        $initialStock = 100;
        $quantity = 5;
        $price = 2000;

        $product = Product::create([
            'name' => 'Empanada',
            'category' => 'Fritos',
            'price' => $price,
            'stock' => $initialStock
        ]);

        $payload = [
            'productId' => $product->id,
            'productName' => $product->name,
            'quantity' => $quantity,
            'unitPrice' => $price,
            'total' => $quantity * $price,
            'paymentMethod' => 'cash'
        ];

        $response = $this->postJson('/api/sales', $payload);

        $response->assertStatus(201);
        
        $this->assertDatabaseHas('sales', [
            'product_id' => $product->id,
            'quantity' => $quantity
        ]);

        // Verify Stock Reduction
        $this->assertEquals($initialStock - $quantity, $product->fresh()->stock);
    }

    public function test_cannot_sell_more_than_stock()
    {
        $product = Product::create([
            'name' => 'Limited Item',
            'category' => 'Exclusive',
            'price' => 10000,
            'stock' => 2
        ]);

        $payload = [
            'productId' => $product->id,
            'productName' => $product->name,
            'quantity' => 5, // Exceeds stock
            'unitPrice' => 10000,
            'total' => 50000
        ];

        $response = $this->postJson('/api/sales', $payload);

        $response->assertStatus(400); // Controller aborts with 400
        $this->assertEquals(2, $product->fresh()->stock);
    }
    public function test_can_return_sale_and_restore_stock()
    {
        $initialStock = 10;
        $quantity = 2;
        
        $product = Product::create([
            'name' => 'Returnable Item',
            'category' => 'Test',
            'price' => 5000,
            'stock' => $initialStock - $quantity // Already sold
        ]);

        $sale = Sale::create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => $quantity,
            'unit_price' => 5000,
            'total' => 10000,
            'sale_date' => now(),
            'status' => 'completed'
        ]);

        $response = $this->putJson("/api/sales/{$sale->id}", [
            'status' => 'returned'
        ]);

        $response->assertStatus(200);
        $this->assertEquals('returned', $sale->fresh()->status);
        $this->assertEquals($initialStock, $product->fresh()->stock);
    }

    public function test_can_return_partial_sale_quantity()
    {
        $initialStock = 10;
        $quantity = 5;
        $returnQty = 2;
        
        $product = Product::create([
            'name' => 'Partial Item',
            'category' => 'Test',
            'price' => 5000,
            'stock' => $initialStock - $quantity
        ]);

        $sale = Sale::create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => $quantity,
            'unit_price' => 5000,
            'total' => $quantity * 5000,
            'sale_date' => now(),
            'status' => 'completed',
            'payment_method' => 'cash',
            'cash_amount' => $quantity * 5000,
            'transfer_amount' => 0
        ]);

        $response = $this->putJson("/api/sales/{$sale->id}", [
            'status' => 'returned',
            'return_quantity' => $returnQty
        ]);

        $response->assertStatus(201); // Controller returns 201 (Created) for the new split record
        // Controller returns the new model, default status 200 for PUT usually, but let's see. 
        // Actually, Controller returns `$returnedSale` or `$sale`. 
        // Laravel default for successful request is 200.

        // 1. Verify Original Sale Reduced
        $this->assertEquals(3, $sale->fresh()->quantity);
        $this->assertEquals(15000, $sale->fresh()->total);

        // 2. Verify New Returned Sale Created
        $this->assertDatabaseHas('sales', [
            'product_id' => $product->id,
            'quantity' => $returnQty,
            'status' => 'returned',
            'total' => 10000
        ]);

        // 3. Verify Stock Restored (+2)
        // Initial was 5 (10-5). Restored 2 = 7.
        $this->assertEquals(7, $product->fresh()->stock);
    }

    public function test_cannot_return_more_than_sold_quantity()
    {
        $product = Product::create([
            'name' => 'Test', 
            'price' => 100, 
            'stock' => 10,
            'category' => 'Test'
        ]);
        $sale = Sale::create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => 2,
            'unit_price' => 100,
            'total' => 200,
            'status' => 'completed',
            'payment_method' => 'cash',
            'sale_date' => now()
        ]);

        $response = $this->putJson("/api/sales/{$sale->id}", [
            'status' => 'returned',
            'return_quantity' => 3
        ]);

        $response->assertStatus(400);
    }


    public function test_cannot_create_sale_with_invalid_data()
    {
        $response = $this->postJson('/api/sales', [
            'productId' => '',
            'quantity' => -5,
            'total' => 'abc'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['productId', 'quantity']);
    }

    public function test_cannot_create_sale_with_zero_quantity()
    {
        $product = Product::create([
            'name' => 'Zero Qty Item',
            'category' => 'Test',
            'price' => 1000,
            'stock' => 10
        ]);

        $response = $this->postJson('/api/sales', [
            'productId' => $product->id,
            'productName' => $product->name,
            'quantity' => 0,
            'unitPrice' => 1000,
            'total' => 0,
            'paymentMethod' => 'cash'
        ]);

        $response->assertStatus(422);
    }

    public function test_unauthenticated_user_cannot_access_sales()
    {
        \Illuminate\Support\Facades\Auth::logout();

        $response = $this->postJson('/api/sales', []);
        $response->assertStatus(401);
    }
}
