<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmployeeAdvance;
use Illuminate\Http\Request;

class EmployeeAdvanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = EmployeeAdvance::with('employee');
        
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'amount' => 'required|numeric|min:0.01',
            'request_date' => 'required|date',
            'reason' => 'nullable|string|max:255',
            'status' => 'in:pending,deducted,cancelled'
        ]);

        $advance = EmployeeAdvance::create($validated);
        return response()->json($advance->load('employee'), 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $advance = EmployeeAdvance::findOrFail($id);
        
        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0.01',
            'request_date' => 'sometimes|date',
            'reason' => 'nullable|string|max:255',
            'status' => 'sometimes|in:pending,deducted,cancelled'
        ]);

        $advance->update($validated);
        return response()->json($advance->load('employee'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $advance = EmployeeAdvance::findOrFail($id);
        $advance->delete();
        return response()->json(null, 204);
    }
}
