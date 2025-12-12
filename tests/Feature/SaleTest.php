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
}
