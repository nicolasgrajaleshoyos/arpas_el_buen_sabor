<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Credit;
use App\Models\CreditItem;
use App\Models\CreditPayment;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CreditController extends Controller
{
    // List all credits with filtering support
    public function index(Request $request)
    {
        $query = Credit::with(['items', 'payments']);

        // Filter by Client Name
        if ($request->has('search') && $request->search != '') {
            $term = $request->search;
            $query->where(function($q) use ($term) {
                $q->where('client_name', 'like', "%{$term}%")
                  ->orWhereHas('items', function($qi) use ($term) {
                      $qi->where('product_name', 'like', "%{$term}%");
                  });
            });
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    // Create a new Credit (Decrement Stock)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            $itemsData = [];

            // Calculate total and prepare items
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                
                if ($product->stock < $item['quantity']) {
                    abort(400, "Stock insuficiente para: {$product->name}");
                }

                $product->decrement('stock', $item['quantity']);

                $lineTotal = $item['quantity'] * $item['unit_price'];
                $totalAmount += $lineTotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $lineTotal,
                ];
            }

            // Create Credit Header
            $credit = Credit::create([
                'client_name' => $validated['client_name'],
                'total_amount' => $totalAmount,
                'status' => 'pending'
            ]);

            // Create Credit Items
            foreach ($itemsData as $data) {
                $credit->items()->create($data);
            }

            return $credit->load('items');
        });
    }

    // Add a payment (Abono)
    public function addPayment(Request $request, $id)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
        ]);

        return DB::transaction(function () use ($validated, $id) {
            $credit = Credit::findOrFail($id);

            // Register Payment
            $payment = $credit->payments()->create([
                'amount' => $validated['amount'],
                'payment_date' => $validated['date'],
                'note' => $request->note ?? null
            ]);

            // Update Header
            $credit->paid_amount += $validated['amount'];
            
            // Auto-close if paid in full (allow slight precision tolerance)
            if ($credit->paid_amount >= $credit->total_amount - 0.01) {
                $credit->status = 'paid';
            }

            $credit->save();

            return $credit->load(['items', 'payments']);
        });
    }
}
