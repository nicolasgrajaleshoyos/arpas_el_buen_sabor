<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\RawMaterial;
use App\Models\Supplier;
use App\Models\MaterialTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $query = Purchase::with('supplier');

        // Get available years for the filter
        $years = Purchase::pluck('purchase_date')
            ->map(function ($date) {
                return \Carbon\Carbon::parse($date)->year;
            })
            ->unique()
            ->sortDesc();

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function($subQ) use ($search) {
                      $subQ->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('items.rawMaterial', function($subQ) use ($search) {
                      $subQ->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('year') && $request->year != '') {
            $query->whereYear('purchase_date', $request->year);
        }

        if ($request->has('date_from') && $request->date_from != '') {
            $query->whereDate('purchase_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to != '') {
            $query->whereDate('purchase_date', '<=', $request->date_to);
        }

        $purchases = $query->orderBy('purchase_date', 'desc')->paginate(10);

        return view('purchases.index', compact('purchases', 'years'));
    }

    public function create()
    {
        $suppliers = Supplier::all();
        $rawMaterials = RawMaterial::all();
        return view('purchases.create', compact('suppliers', 'rawMaterials'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'reference_number' => 'required|unique:purchases,reference_number',
            'purchase_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.raw_material_id' => 'required|exists:raw_materials,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.unit_type' => 'nullable|string|in:base,package',
        ]);

        try {
            DB::beginTransaction();

            // Prepare items with converted values
            $processedItems = [];
            $totalAmount = 0;

            foreach ($request->items as $itemData) {
                $rawMaterial = RawMaterial::find($itemData['raw_material_id']);
                if (!$rawMaterial) continue;

                $quantity = floatval($itemData['quantity']);
                $price = floatval($itemData['unit_price']);
                $unitType = $itemData['unit_type'] ?? 'base';

                // Handle Conversions
                if ($unitType === 'package') {
                    // User entered Packages (e.g. 10 boxes) and Price per Package (e.g. 50,000)
                    // We need to convert to Base Units (e.g. Grams) for Stock
                    if ($rawMaterial->quantity_per_package > 0) {
                        $quantity = $quantity * $rawMaterial->quantity_per_package;
                        // Normalize Price: PricePerPackage / QtyPerPackage = PricePerBaseUnit
                        $price = $price / $rawMaterial->quantity_per_package;
                    }
                } else {
                    // Base Unit (e.g. Grams)
                    // If unit is g/ml, User usually enters Price Per KG/L
                    // We need to normalize Price to Per Gram/ML to make "Qty * Price" work correctly
                    $unit = strtolower($rawMaterial->unit ?? '');
                    if (in_array($unit, ['g', 'gr', 'gramo', 'gramos', 'ml', 'mililitro', 'mililitros'])) {
                        $price = $price / 1000;
                    }
                }

                // Round to nearest integer (Colombian Pesos has no cents)
                $lineTotal = round($quantity * $price);
                $totalAmount += $lineTotal;

                $processedItems[] = [
                    'raw_material_id' => $rawMaterial->id,
                    'quantity' => $quantity, // Stored in Base Units (e.g. Grams)
                    'unit_price' => $price,  // Stored in Price Per Base Unit (e.g. Per Gram) - Keep precision here ideally, but final value rounded
                    'total_price' => $lineTotal
                ];
            }

            $purchase = Purchase::create([
                'supplier_id' => $request->supplier_id,
                'reference_number' => $request->reference_number,
                'purchase_date' => $request->purchase_date,
                'total_amount' => $totalAmount,
            ]);

            foreach ($processedItems as $item) {
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'raw_material_id' => $item['raw_material_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['total_price'],
                ]);

                // Update Stock
                $rawMaterial = RawMaterial::find($item['raw_material_id']);
                $rawMaterial->stock += $item['quantity'];
                // Update price (store the normalised price)
                $rawMaterial->price = $item['unit_price']; 
                $rawMaterial->save();

                // Log Transaction
                MaterialTransaction::create([
                    'raw_material_id' => $item['raw_material_id'],
                    'material_name' => $rawMaterial->name,
                    'type' => 'Compra',
                    'quantity' => $item['quantity'],
                    'notes' => 'Compra Ref: ' . $purchase->reference_number,
                    'transaction_date' => $purchase->purchase_date,
                ]);
            }

            DB::commit();

            return redirect()->route('purchases.index')->with('success', 'Compra registrada exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al registrar la compra: ' . $e->getMessage())->withInput();
        }
    }

    public function show(Purchase $purchase)
    {
        $purchase->load('items.rawMaterial', 'supplier');
        return view('purchases.show', compact('purchase'));
    }

    public function destroy(Purchase $purchase)
    {
        try {
            DB::beginTransaction();

            // Revert Stock for each item
            foreach ($purchase->items as $item) {
                $rawMaterial = RawMaterial::find($item->raw_material_id);
                if ($rawMaterial) {
                    $rawMaterial->stock -= $item->quantity;
                    $rawMaterial->save();

                    // Log Reversal Transaction
                    MaterialTransaction::create([
                        'raw_material_id' => $item->raw_material_id,
                        'material_name' => $rawMaterial->name,
                        'type' => 'Ajuste', // or 'Salida' but Ajuste is clearer for correction
                        'quantity' => $item->quantity,
                        'notes' => 'Reversión venta eliminada Ref: ' . $purchase->reference_number,
                        'transaction_date' => now(),
                    ]);
                }
            }

            // Delete items first (though cascade might handle it, better explicit)
            $purchase->items()->delete();
            
            // Delete purchase
            $purchase->delete();

            DB::commit();

            return redirect()->route('purchases.index')->with('success', 'Compra eliminada y stock revertido exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al eliminar la compra: ' . $e->getMessage());
        }
    }
}
