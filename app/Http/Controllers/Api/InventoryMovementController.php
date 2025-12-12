<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;

class InventoryMovementController extends Controller
{
    public function index()
    {
        return InventoryMovement::with('product')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'productId' => 'required|exists:products,id',
            'type' => 'required|string',
            'quantity' => 'required|integer',
            'description' => 'nullable|string',
            'custom_date' => 'nullable|date'
        ]);

        $movement = InventoryMovement::create([
            'product_id' => $validated['productId'],
            'type' => $validated['type'],
            'quantity' => $validated['quantity'],
            'description' => $validated['description'] ?? null,
            'created_at' => $validated['custom_date'] ?? now()
        ]);

        return response()->json($movement, 201);
    }
    public function destroy($id)
    {
        try {
            $movement = InventoryMovement::findOrFail($id);
            $product = $movement->product;

            // Revert stock change
            if ($movement->type === 'entrada') {
                $product->stock -= $movement->quantity;
            } else {
                $product->stock += $movement->quantity;
            }

            // Prevent negative stock
            if ($product->stock < 0) {
                return response()->json([
                    'message' => 'No se puede eliminar este movimiento porque dejaría el stock en negativo.'
                ], 422);
            }

            $product->save();
            $movement->delete();

            return response()->json(['message' => 'Movimiento eliminado y stock actualizado.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error eliminando movimiento'], 500);
        }
    }
}
