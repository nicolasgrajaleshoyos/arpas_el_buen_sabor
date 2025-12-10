<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RawMaterial;

class RawMaterialController extends Controller
{
    public function index()
    {
        return response()->json(RawMaterial::with(['supplier', 'product'])->get());
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'unit' => 'required|string|max:50',
                'stock' => 'required|numeric|min:0',
                'min_stock' => 'required|numeric|min:0',
                'price' => 'required|numeric|min:0',
                'packaging_unit' => 'nullable|string|max:50',
                'quantity_per_package' => 'nullable|numeric|min:0',
                'supplier_id' => 'nullable|exists:suppliers,id',
                'product_id' => 'nullable|exists:products,id',
            ]);

            $material = RawMaterial::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Materia prima creada exitosamente',
                'data' => $material
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error creating raw material: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al crear materia prima: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $material = RawMaterial::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'unit' => 'required|string|max:50',
                'stock' => 'required|numeric|min:0',
                'min_stock' => 'required|numeric|min:0',
                'price' => 'required|numeric|min:0',
                'packaging_unit' => 'nullable|string|max:50',
                'quantity_per_package' => 'nullable|numeric|min:0',
                'supplier_id' => 'nullable|exists:suppliers,id',
                'product_id' => 'nullable|exists:products,id',
            ]);

            $material->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Materia prima actualizada exitosamente',
                'data' => $material
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error updating raw material: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar materia prima: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        $material = RawMaterial::findOrFail($id);
        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Materia prima eliminada exitosamente'
        ]);
    }
}
