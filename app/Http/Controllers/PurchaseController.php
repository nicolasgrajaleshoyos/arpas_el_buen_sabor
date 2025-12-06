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

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('reference_number', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        $purchases = $query->orderBy('purchase_date', 'desc')->paginate(10);

        return view('purchases.index', compact('purchases'));
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
        ]);

        try {
            DB::beginTransaction();

            $totalAmount = 0;
            foreach ($request->items as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $purchase = Purchase::create([
                'supplier_id' => $request->supplier_id,
                'reference_number' => $request->reference_number,
                'purchase_date' => $request->purchase_date,
                'total_amount' => $totalAmount,
            ]);

            foreach ($request->items as $item) {
                $totalPrice = $item['quantity'] * $item['unit_price'];

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'raw_material_id' => $item['raw_material_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $totalPrice,
                ]);

                // Update Stock
                $rawMaterial = RawMaterial::find($item['raw_material_id']);
                $rawMaterial->stock += $item['quantity'];
                // Optional: Update price to latest purchase price or average
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
}
