<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RawMaterialSeeder extends Seeder
{
    public function run(): void
    {
        // Create Suppliers
        $supplier1 = \App\Models\Supplier::create([
            'name' => 'Distribuidora El Maíz',
            'nit' => '900123456-7',
            'phone' => '3001234567',
            'email' => 'contacto@elmaiz.com',
            'address' => 'Calle 45 #23-12',
            'products' => 'Harina de Maíz, Queso',
        ]);

        $supplier2 = \App\Models\Supplier::create([
            'name' => 'Avícola Santa Rita',
            'nit' => '800987654-3',
            'phone' => '3109876543',
            'email' => 'ventas@santarita.com',
            'address' => 'Carrera 10 #5-20',
            'products' => 'Huevos, Pollo',
        ]);

        $supplier3 = \App\Models\Supplier::create([
            'name' => 'Carnes del Valle',
            'nit' => '901234567-8',
            'phone' => '3201234567',
            'email' => 'pedidos@carnesdelvalle.com',
            'address' => 'Avenida 30 #15-45',
            'products' => 'Carne Molida',
        ]);

        // Create Raw Materials linked to Suppliers
        \App\Models\RawMaterial::create([
            'name' => 'Harina de Maíz',
            'unit' => 'kg',
            'stock' => 100,
            'min_stock' => 20,
            'price' => 2500,
            'supplier_id' => $supplier1->id,
        ]);

        \App\Models\RawMaterial::create([
            'name' => 'Queso',
            'unit' => 'kg',
            'stock' => 50,
            'min_stock' => 10,
            'price' => 15000,
            'supplier_id' => $supplier1->id,
        ]);

        \App\Models\RawMaterial::create([
            'name' => 'Huevos',
            'unit' => 'unidad',
            'stock' => 200,
            'min_stock' => 50,
            'price' => 500,
            'supplier_id' => $supplier2->id,
        ]);

        \App\Models\RawMaterial::create([
            'name' => 'Pollo',
            'unit' => 'kg',
            'stock' => 40,
            'min_stock' => 8,
            'price' => 12000,
            'supplier_id' => $supplier2->id,
        ]);

        \App\Models\RawMaterial::create([
            'name' => 'Carne Molida',
            'unit' => 'kg',
            'stock' => 30,
            'min_stock' => 5,
            'price' => 18000,
            'supplier_id' => $supplier3->id,
        ]);
    }
}
