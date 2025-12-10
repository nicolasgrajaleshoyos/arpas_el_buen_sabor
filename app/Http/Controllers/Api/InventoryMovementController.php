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
            'description' => 'nullable|string'
        ]);

        $movement = InventoryMovement::create([
            'product_id' => $validated['productId'],
            'type' => $validated['type'],
            'quantity' => $validated['quantity'],
            'description' => $validated['description'] ?? null
        ]);

        return response()->json($movement, 201);
    }
}
