<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Product;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Sale::orderBy('date', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'productId' => 'required|exists:products,id',
            'productName' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'unitPrice' => 'required|numeric',
            'total' => 'required|numeric',
            'date' => 'nullable|date',
            'status' => 'nullable|string',
            'returnedAt' => 'nullable|date'
        ]);

        // Map JS camelCase to DB snake_case & Decrement Stock
        $sale = \Illuminate\Support\Facades\DB::transaction(function () use ($validated) {
            $product = Product::findOrFail($validated['productId']);
            
            if ($product->stock < $validated['quantity']) {
                abort(400, 'Insufficient stock');
            }

            $product->decrement('stock', $validated['quantity']);

            return Sale::create([
                'product_id' => $validated['productId'],
                'product_name' => $validated['productName'],
                'quantity' => $validated['quantity'],
                'unit_price' => $validated['unitPrice'],
                'total' => $validated['total'],
                'sale_date' => $validated['date'] ?? now(),
                'status' => $validated['status'] ?? 'completed',
                'returned_at' => $validated['returnedAt'] ?? null
            ]);
        });

        return response()->json($sale, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $sale = Sale::findOrFail($id);
        
        // Handle Return Status Update
        if ($request->has('status') && $request->status === 'returned') {
             $sale->update([
                 'status' => 'returned',
                 'returned_at' => now()
             ]);
             
             // Restore stock
             $sale->product->increment('stock', $sale->quantity);
             return response()->json($sale);
        }

        return response()->json(['message' => 'Update not fully implemented for other fields'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $sale = Sale::findOrFail($id);
        $sale->delete();
        return response()->json(null, 204);
    }
}
