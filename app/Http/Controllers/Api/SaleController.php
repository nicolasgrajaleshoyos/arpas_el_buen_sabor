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
        return Sale::orderBy('sale_date', 'desc')->get();
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
            'description' => 'nullable|string',
            'date' => 'nullable|date',
            'status' => 'nullable|string',
            'returnedAt' => 'nullable|date',
            'cashAmount' => 'nullable|numeric|min:0',
            'transferAmount' => 'nullable|numeric|min:0',
            'paymentMethod' => 'nullable|string'
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
                'description' => $validated['description'] ?? null,
                'sale_date' => $validated['date'] ?? now(),
                'status' => $validated['status'] ?? 'completed',
                'returned_at' => $validated['returnedAt'] ?? null,
                'cash_amount' => $validated['cashAmount'] ?? 0,
                'transfer_amount' => $validated['transferAmount'] ?? 0,
                'payment_method' => $validated['paymentMethod'] ?? 'cash'
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
        // Handle Return Logic
        if ($request->has('status') && $request->status === 'returned') {
            $returnQty = $request->input('return_quantity', $sale->quantity); // Default to full quantity if not provided

            // Validate return quantity
            if ($returnQty <= 0 || $returnQty > $sale->quantity) {
                return response()->json(['message' => 'Invalid return quantity'], 400);
            }

            return \Illuminate\Support\Facades\DB::transaction(function () use ($sale, $returnQty, $request) {
                // If partial return
                if ($returnQty < $sale->quantity) {
                    $remainingQty = $sale->quantity - $returnQty;
                    $unitPrice = $sale->unit_price;
                    
                    // 1. Create new Sale record for the returned items
                    $returnedSale = $sale->replicate();
                    $returnedSale->quantity = $returnQty;
                    $returnedSale->total = $unitPrice * $returnQty;
                    $returnedSale->status = 'returned';
                    $returnedSale->returned_at = $request->input('returned_at') ?? now();
                    // Cash/Transfer split for returned item (proportional)
                    $ratio = $returnQty / $sale->quantity;
                    $returnedSale->cash_amount = $sale->cash_amount * $ratio;
                    $returnedSale->transfer_amount = $sale->transfer_amount * $ratio;
                    $returnedSale->save();

                    // 2. Update original Sale record (remaining items)
                    $sale->quantity = $remainingQty;
                    $sale->total = $unitPrice * $remainingQty;
                    $sale->cash_amount = $sale->cash_amount - $returnedSale->cash_amount;
                    $sale->transfer_amount = $sale->transfer_amount - $returnedSale->transfer_amount;
                    $sale->save();

                    // 3. Restore stock for returned quantity
                    $sale->product->increment('stock', $returnQty);

                    return $returnedSale;
                } else {
                    // Full return
                    $sale->update([
                        'status' => 'returned',
                        'returned_at' => $request->input('returned_at') ?? now()
                    ]);
                    
                    // Restore stock for full quantity
                    $sale->product->increment('stock', $sale->quantity);
                    return $sale;
                }
            });
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
