<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create a user and authenticate
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user);
    }

    public function test_can_list_products()
    {
        Product::create([
            'name' => 'Arepa de Queso',
            'category' => 'Comida',
            'price' => 5000,
            'stock' => 10
        ]);

        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Arepa de Queso']);
    }

    public function test_can_create_product()
    {
        $data = [
            'name' => 'New Product',
            'category' => 'Bebidas',
            'price' => 2000,
            'stock' => 50
        ];

        $response = $this->postJson('/api/products', $data);

        $response->assertStatus(201); // Assuming 201 Created, or 200 depending on controller
        $this->assertDatabaseHas('products', ['name' => 'New Product']);
    }

    public function test_can_update_product()
    {
        $product = Product::create([
            'name' => 'Old Name',
            'category' => 'General',
            'price' => 1000,
            'stock' => 10
        ]);

        $updateData = [
            'name' => 'New Name',
            'category' => 'General',
            'price' => 1200,
            'stock' => 15
        ];

        $response = $this->putJson("/api/products/{$product->id}", $updateData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('products', ['name' => 'New Name', 'price' => 1200]);
    }

    public function test_can_delete_product()
    {
        $product = Product::create([
            'name' => 'To Delete',
            'category' => 'General',
            'price' => 1000,
            'stock' => 10
        ]);

        $response = $this->deleteJson("/api/products/{$product->id}");

        $response->assertStatus(204); // Or 204
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }
}
