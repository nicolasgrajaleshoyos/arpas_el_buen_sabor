<?php

namespace Tests\Feature;

use App\Models\Credit;
use App\Models\CreditItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreditTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $user = User::factory()->create();
        $this->actingAs($user);
    }

    public function test_can_list_credits()
    {
        Credit::create([
            'client_name' => 'John Doe',
            'total_amount' => 50000,
            'status' => 'pending'
        ]);

        $response = $this->getJson('/api/credits');

        $response->assertStatus(200)
            ->assertJsonFragment(['client_name' => 'John Doe'])
            ->assertJsonStructure(['*' => ['id', 'client_name', 'total_amount', 'paid_amount', 'status']]);
    }

    public function test_can_create_credit()
    {
        // 1. Create Product
        $product = Product::create([
            'name' => 'Credit Item',
            'category' => 'Test',
            'price' => 10000,
            'stock' => 10
        ]);

        // 2. Payload
        $data = [
            'client_name' => 'New Client',
            'items' => [
                [
                    'product_id' => $product->id,
                    'name' => $product->name, 
                    'quantity' => 2,
                    'unit_price' => 10000
                ]
            ],
            'total' => 20000
        ];

        // 3. Post (Assuming endpoint is /api/credits or similar logic in SaleController depending on implementation, 
        // usually credits are sales with specific status or separate endpoint. 
        // Checking Controller... if CreditController@store exists)
        
        $response = $this->postJson('/api/credits', $data);
        
        // Note: If no specific CreditController@store exists and it uses SaleController, this might need adjustment.
        // Based on file list, CreditController exists.
        
        $response->assertStatus(201);
        $this->assertDatabaseHas('credits', ['client_name' => 'New Client']);
        
        // Verify stock reduction confirmed? Usually credits also reduce stock.
        $this->assertEquals(8, $product->fresh()->stock);
    }

    public function test_can_add_payment_to_credit()
    {
        $credit = Credit::create([
            'client_name' => 'Debtor',
            'total_amount' => 100000,
            'status' => 'pending'
        ]);

        $response = $this->postJson("/api/credits/{$credit->id}/payments", [
            'amount' => 20000,
            'date' => now()->toDateString()
        ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('credit_payments', [
            'credit_id' => $credit->id,
            'amount' => 20000
        ]);
        
        // Verify Status - remaining 80000, still pending
        $this->assertEquals('pending', $credit->fresh()->status);
        
        // Pay remaining
        $this->postJson("/api/credits/{$credit->id}/payments", [
            'amount' => 80000,
            'date' => now()->toDateString()
        ]);
        
        // Verify Status - Paid
        $this->assertEquals('paid', $credit->fresh()->status);
    }

    public function test_can_delete_credit_and_restore_stock()
    {
        // Setup
        $initialStock = 100;
        $product = Product::create([
            'name' => 'Test Product',
            'category' => 'General',
            'stock' => $initialStock,
            'price' => 1000
        ]);
    
        $quantitySold = 10;
        
        // Simulate pre-existing credit state (stock already reduced)
        $product->update(['stock' => $initialStock - $quantitySold]);
        
        $credit = Credit::create([
            'client_name' => 'Test Client',
            'total_amount' => $quantitySold * $product->price,
            'status' => 'pending'
        ]);
    
        CreditItem::create([
            'credit_id' => $credit->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => $quantitySold,
            'unit_price' => $product->price,
            'total' => $quantitySold * $product->price
        ]);
    
        // Action
        $response = $this->deleteJson("/api/credits/{$credit->id}");
    
        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseMissing('credits', ['id' => $credit->id]);
        $this->assertEquals($initialStock, $product->fresh()->stock);
    }

    
    public function test_cannot_create_credit_with_invalid_data()
    {
        $response = $this->postJson('/api/credits', [
            'client_name' => '', // Empty name
            'items' => [], // Empty items
            'total' => 'invalid' // Invalid total
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['client_name', 'items']);
    }

    public function test_cannot_create_credit_with_insufficient_stock()
    {
        $product = Product::create([
            'name' => 'Low Stock Item',
            'category' => 'Test',
            'price' => 1000,
            'stock' => 1
        ]);

        $data = [
            'client_name' => 'Test Client',
            'items' => [
                [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'quantity' => 5, // Exceeds stock (1)
                    'unit_price' => 1000
                ]
            ],
            'total' => 5000
        ];

        $response = $this->postJson('/api/credits', $data);

        $response->assertStatus(400); // Expecting 400 Bad Request
        $this->assertDatabaseMissing('credits', ['client_name' => 'Test Client']);
    }

    public function test_unauthenticated_user_cannot_access_credits()
    {
        // Logout user
        \Illuminate\Support\Facades\Auth::logout();

        $response = $this->getJson('/api/credits');
        $response->assertStatus(401);

        $response = $this->postJson('/api/credits', []);
        $response->assertStatus(401);
    }
}
