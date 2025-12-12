<?php

namespace Tests\Feature;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $user = User::factory()->create();
        $this->actingAs($user);
    }

    public function test_dashboard_stats_calculation()
    {
        // 1. Create Data
        // Product
        $product = \App\Models\Product::create([
             'name' => 'Test',
             'category' => 'Test',
             'price' => 10000,
             'stock' => 10
        ]);

        // Revenue: 10000
        Sale::create([
            'sale_date' => now(),
            'total' => 10000,
            'status' => 'completed',
            'product_id' => $product->id,
            'product_name' => 'Test',
            'quantity' => 1,
            'unit_price' => 10000
        ]);

        // 2. Call Dashboard Endpoint
        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(200);
        
        // 3. Verify Revenue Matches
        $response->assertJsonFragment(['monthlySales' => 10000]);
        
        // 4. Verify Structure
        $response->assertJsonStructure([
            'monthlySales',
            'profit',
            'inventoryValue',
            'charts' => ['sales', 'returns']
        ]);
    }
}
