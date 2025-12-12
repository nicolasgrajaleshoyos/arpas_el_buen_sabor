<?php

namespace Tests\Feature;

use App\Models\RawMaterial;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierMaterialTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $user = User::factory()->create();
        $this->actingAs($user);
    }

    public function test_can_create_supplier()
    {
        $data = [
            'name' => 'Proveedor Test',
            'nit' => '900123456', // Added NIT
            'phone' => '123456789',
            'email' => 'juan@test.com'
        ];

        $response = $this->postJson('/api/suppliers', $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('suppliers', ['email' => 'juan@test.com']);
    }

    public function test_can_create_raw_material()
    {
        $supplier = Supplier::create([
            'name' => 'Prov 1',
            'nit' => '900888777',
            'phone' => '123',
            'email' => 't@t.com'
        ]);

        $data = [
            'name' => 'Harina',
            'supplier_id' => $supplier->id,
            'unit' => 'kg',
            'quantity_per_package' => 1,
            'price' => 2000,
            'stock' => 10,
            'min_stock' => 5
        ];

        $response = $this->postJson('/api/raw-materials', $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('raw_materials', ['name' => 'Harina']);
    }

    public function test_purchase_increases_stock()
    {
        $supplier = Supplier::create([
            'name' => 'Prov 2',
            'nit' => '900555444', 
            'phone' => '1234',
            'email' => 'p2@test.com'
        ]);

        $material = RawMaterial::create([
            'name' => 'Queso',
            'supplier_id' => $supplier->id,
            'unit' => 'g',
            'stock' => 1000,
            'price' => 15
        ]);

        $purchaseData = [
            'supplier_id' => $supplier->id,
            'reference_number' => 'REF-1001',
            'purchase_date' => now()->toDateString(),
            'items' => [
                [
                    'raw_material_id' => $material->id,
                    'quantity' => 500,
                    'unit_price' => 20,
                    'unit_type' => 'base'
                ]
            ]
        ];

        $response = $this->post('/purchases', $purchaseData);

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        $this->assertEquals(1500, $material->fresh()->stock);
    }
}
