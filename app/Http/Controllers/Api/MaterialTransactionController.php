<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MaterialTransaction;
use App\Models\RawMaterial;

class MaterialTransactionController extends Controller
{
    public function index()
    {
        return response()->json(
            MaterialTransaction::with('rawMaterial')
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'raw_material_id' => 'required|exists:raw_materials,id',
                'type' => 'required|string|max:100',
                'quantity' => 'required|numeric|min:0.01',
                'notes' => 'nullable|string',
                'transaction_date' => 'nullable|date',
            ]);

            // Get the material
            $material = RawMaterial::findOrFail($validated['raw_material_id']);

            // All types are deductions (reduce stock)
            $newStock = $material->stock - $validated['quantity'];
            
            if ($newStock < 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock insuficiente. Stock actual: ' . $material->stock
                ], 422);
            }

            // Create transaction
            $transaction = MaterialTransaction::create([
                'raw_material_id' => $validated['raw_material_id'],
                'material_name' => $material->name,
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'notes' => $validated['notes'] ?? null,
                'transaction_date' => $validated['transaction_date'] ?? now(),
            ]);

            // Update material stock
            $material->update(['stock' => $newStock]);

            return response()->json([
                'success' => true,
                'message' => 'Transacción registrada exitosamente',
                'data' => $transaction->load('rawMaterial')
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación: ' . collect($e->errors())->flatten()->first(),
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error creating transaction: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al crear transacción: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $transaction = MaterialTransaction::findOrFail($id);
            
            // Only allow deletion of manual transactions (not purchases)
            if ($transaction->type === 'Compra') {
                return response()->json([
                    'success' => false,
                    'message' => 'No se pueden eliminar transacciones de compra. Elimine la compra desde el módulo de Compras.'
                ], 403);
            }

            // Get the material to restore stock
            $material = RawMaterial::findOrFail($transaction->raw_material_id);
            
            // Restore stock (add back the quantity since it was a deduction)
            $material->stock += $transaction->quantity;
            $material->save();

            // Delete the transaction
            $transaction->delete();

            return response()->json([
                'success' => true,
                'message' => 'Transacción eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error deleting transaction: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar transacción: ' . $e->getMessage()
            ], 500);
        }
    }
}
