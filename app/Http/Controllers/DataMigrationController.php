<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Supplier;
use App\Models\RawMaterial;
use Illuminate\Support\Facades\DB;

class DataMigrationController extends Controller
{
    public function migrate(Request $request)
    {
        try {
            // Log raw request for debugging
            \Illuminate\Support\Facades\Log::info('Raw Migration Request', ['content' => $request->getContent()]);

            $data = $request->all();
            
            // Validate basic structure
            if (!is_array($data)) {
                throw new \Exception('Invalid payload format: Expected JSON object.');
            }

            $suppliersData = $data['suppliers'] ?? [];
            $materialsData = $data['rawMaterials'] ?? [];

            DB::beginTransaction();
            
            $supplierMap = []; 
            $migratedSuppliers = 0;
            $migratedMaterials = 0;
            $errors = [];

            // Migrate Suppliers
            foreach ($suppliersData as $supplierData) {
                try {
                    $name = $supplierData['name'] ?? 'Proveedor Sin Nombre';
                    $nit = $supplierData['nit'] ?? null;
                    
                    $supplier = null;
                    if ($nit) $supplier = Supplier::where('nit', $nit)->first();
                    if (!$supplier) $supplier = Supplier::where('name', $name)->first();

                    if (!$supplier) {
                        $supplier = Supplier::create([
                            'name' => $name,
                            'nit' => $nit,
                            'phone' => $supplierData['phone'] ?? null,
                            'email' => $supplierData['email'] ?? null,
                            'address' => $supplierData['address'] ?? null,
                            'products' => $supplierData['products'] ?? null,
                        ]);
                    }

                    $supplierMap[$supplierData['id']] = $supplier->id;
                    $migratedSuppliers++;
                } catch (\Exception $e) {
                    $errors[] = "Error proveedor {$name}: " . $e->getMessage();
                }
            }

            // Migrate Raw Materials
            foreach ($materialsData as $materialData) {
                try {
                    $supplierId = null;
                    if (isset($materialData['supplierId']) && isset($supplierMap[$materialData['supplierId']])) {
                        $supplierId = $supplierMap[$materialData['supplierId']];
                    }

                    RawMaterial::updateOrCreate(
                        ['name' => $materialData['name']],
                        [
                            'unit' => $materialData['unit'] ?? 'unidad',
                            'stock' => $materialData['stock'] ?? 0,
                            'min_stock' => $materialData['minStock'] ?? 0,
                            'price' => $materialData['price'] ?? 0,
                            'supplier_id' => $supplierId,
                        ]
                    );
                    $migratedMaterials++;
                } catch (\Exception $e) {
                    $errors[] = "Error material {$materialData['name']}: " . $e->getMessage();
                }
            }

            DB::commit();
            
            return response()->json([
                'success' => true, 
                'message' => "Se migraron {$migratedSuppliers} proveedores y {$migratedMaterials} productos.",
                'errors' => $errors
            ]);

        } catch (\Throwable $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            \Illuminate\Support\Facades\Log::error('Migration Fatal Error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false, 
                'message' => 'Error crítico del servidor: ' . $e->getMessage()
            ], 200); // Return 200 so frontend can read the JSON error message
        }
    }
}
