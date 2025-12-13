<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Payroll::orderByDesc('year')->orderByDesc('month')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:0|max:11',
            'year' => 'required|integer|min:2020',
            'employees' => 'required|array',
            'total' => 'required|numeric|min:0',
            'generated_date' => 'required|date'
        ]);

        // Check if payroll already exists for this period
        $exists = Payroll::where('month', $validated['month'])
            ->where('year', $validated['year'])
            ->first();

        if ($exists) {
            // Update existing or return error? For simplified flow, we'll allow overwrite logic or just delete old one from frontend first.
            // But here, let's just create new or update if ID provided (but store is for new).
            // Let's assume frontend handles "overwrite" by calling delete first or we find and replace.
             $exists->update($validated);
             return response()->json($exists, 200);
        }

        $payroll = Payroll::create($validated);
        
        // Mark advances as deducted if present in the data
        if (!empty($employees)) {
            foreach ($employees as $empData) {
                if (!empty($empData['deducted_advance_ids']) && is_array($empData['deducted_advance_ids'])) {
                     \Illuminate\Support\Facades\Log::info('Marking advances as deducted:', $empData['deducted_advance_ids']);
                     \App\Models\EmployeeAdvance::whereIn('id', $empData['deducted_advance_ids'])
                        ->update(['status' => 'deducted']);
                }
            }
        }
        
        return response()->json($payroll, 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $payroll = Payroll::findOrFail($id);
        $payroll->delete();
        return response()->json(null, 204);
    }
}
