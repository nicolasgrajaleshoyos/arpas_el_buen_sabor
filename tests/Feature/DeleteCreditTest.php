<?php

namespace Tests\Feature;

use App\Models\Credit;
use App\Models\CreditItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeleteCreditTest extends TestCase
{
    use RefreshDatabase;


    public function test_it_can_delete_credit_and_restore_stock()
    {
        // 1. Create a product with known stock
        $initialStock = 100;
        $product = Product::create([
            'name' => 'Test Product',
            'category' => 'General', // Assuming category is required or nullable, providing dummy
            'stock' => $initialStock,
            'price' => 1000
        ]);

        // 2. Create a credit that consumes stock
        $quantitySold = 10;
        
        // Emulate the controller logic or use the factory if it handles stock (factories usually don't invoke controller logic)
        // So we manually decrement or hit the API. Let's hit the API store method to ensure realistic flow.
        
        // We need users/auth usually? The routes seemed public or didn't specify middleware in the snippet I saw, 
        // but typically they are protected. I saw 'auth' view usage.
        // Let's assume we can hit the API or just manually setup the state as the Controller expects.
        // To be safe against auth middleware, I'll use actingAs if I can find a user, or just try.
        
        $user = User::first();
        if (!$user) {
            $user = User::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
                // 'role' => 'admin' // if needed
            ]);
        }

        // Let's manually set up the "Pre-Delete" state to exactly match what we want to test: destroy() logic
        // We simulate that a credit ALREADY exists and stock IS ALREADY decremented.
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

        // 3. Call the destroy endpoint
        $response = $this->actingAs($user)->deleteJson("/api/credits/{$credit->id}");

        $response->assertStatus(200);

        // 4. Verify Credit is gone
        $this->assertDatabaseMissing('credits', ['id' => $credit->id]);
        $this->assertDatabaseMissing('credit_items', ['credit_id' => $credit->id]);

        // 5. Verify Stock is Restored
        $product->refresh();
        $this->assertEquals($initialStock, $product->stock, "Stock should be restored to {$initialStock}");
    }
}
