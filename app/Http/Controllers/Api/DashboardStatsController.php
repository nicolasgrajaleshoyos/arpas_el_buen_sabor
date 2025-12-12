<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Product;
use App\Models\CreditPayment;
use App\Models\Payroll;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardStatsController extends Controller
{
    public function index(Request $request)
    {
        try {
            $month = (int) $request->input('month', date('n') - 1); // JS 0-indexed
            $year = (int) $request->input('year', date('Y'));
            
            // 1. Calculate Current Month Stats
            $currentStats = $this->calculateStats($month, $year);

            // 2. Calculate Previous Month Stats for Trend
            $prevMonth = $month - 1;
            $prevYear = $year;
            if ($prevMonth < 0) { // If Jan (0), go to Dec of prev year
                $prevMonth = 11;
                $prevYear = $year - 1;
            }
            $prevStats = $this->calculateStats($prevMonth, $prevYear);

            // 3. Calculate Trend
            $currentProfit = $currentStats['profit'];
            $previousProfit = $prevStats['profit'];
            
            $profitDifference = $currentProfit - $previousProfit;
            $profitTrend = 0;
            
            if ($previousProfit != 0) {
                $profitTrend = ($profitDifference / abs($previousProfit)) * 100;
            } else if ($currentProfit != 0) {
                $profitTrend = 100; // 100% growth if prev was 0
            }

            // 4. Other Global Stats (Inventory, Products) - Not dependent on month?
            // Actually inventory is current state, not historical.
            $inventoryValue = DB::table('products')->sum(DB::raw('price * stock'));
            $totalProducts = DB::table('products')->count();

            // --- CHARTS (For the selected YEAR) ---
            // Sales per Month (Jan-Dec) for the selected Year
            $salesPerMonth = array_fill(1, 12, 0); 
            $returnsPerMonth = array_fill(1, 12, 0);

            // Aggregate Sales
            $salesCollection = Sale::whereYear('sale_date', $year)
                                   ->whereNull('returned_at')
                                   ->get(['total', 'sale_date']);

            foreach ($salesCollection as $sale) {
                if ($sale->sale_date) {
                    $date = $sale->sale_date instanceof Carbon ? $sale->sale_date : Carbon::parse($sale->sale_date);
                    $m = (int) $date->format('n');
                    $salesPerMonth[$m] += $sale->total;
                }
            }

            // Aggregate Returns
            $returnsCollection = Sale::whereYear('returned_at', $year)
                                     ->whereNotNull('returned_at')
                                     ->get(['total', 'returned_at']);

            foreach ($returnsCollection as $ret) {
                if ($ret->returned_at) {
                    $date = $ret->returned_at instanceof Carbon ? $ret->returned_at : Carbon::parse($ret->returned_at);
                    $m = (int) $date->format('n');
                    $returnsPerMonth[$m] += $ret->total;
                }
            }
            
            return response()->json([
                // Monthly Stats
                'monthlySales' => $currentStats['revenue'],
                'directSales' => $currentStats['directSales'],
                'creditRecovered' => $currentStats['creditRecovered'],
                'monthlyPayroll' => $currentStats['payroll'],
                'monthlyReturns' => $currentStats['returns'],
                'operatingExpenses' => $currentStats['operatingExpenses'],
                'profit' => $currentStats['profit'],
                
                // Trend Info
                'previousProfit' => $previousProfit,
                'profitTrend' => round($profitTrend, 1),
                'profitIncreased' => $profitDifference >= 0,

                // Global Stats
                'inventoryValue' => $inventoryValue,
                'totalProducts' => $totalProducts,
                
                // Charts
                'charts' => [
                    'sales' => array_values($salesPerMonth),
                    'returns' => array_values($returnsPerMonth) 
                ]
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Dashboard Stats Error: ' . $e->getMessage());
            return response()->json(['error' => 'Error processing dashboard data: ' . $e->getMessage()], 500);
        }
    }

    private function calculateStats($jsMonth, $year)
    {
        $phpMonth = $jsMonth + 1; // Convert 0-indexed to 1-indexed

        // 1. Direct Sales
        $directSales = Sale::whereYear('sale_date', $year)
                           ->whereMonth('sale_date', $phpMonth)
                           ->whereNull('returned_at')
                           ->sum('total');
        
        // 2. Credit Payments
        $creditPayments = CreditPayment::whereYear('payment_date', $year)
                                       ->whereMonth('payment_date', $phpMonth)
                                       ->sum('amount');

        // Total Revenue
        $totalRevenue = $directSales + $creditPayments;

        // 3. Returns
        $returns = Sale::whereYear('returned_at', $year)
                       ->whereMonth('returned_at', $phpMonth)
                       ->sum('total');

        // 4. Payroll (Realized Expenses)
        $payroll = Payroll::where('year', $year)
                          ->where(function($query) use ($jsMonth, $phpMonth) {
                              $query->where('month', $jsMonth)
                                    ->orWhere('month', $phpMonth);
                          })
                          ->sum('total');

        // 5. Raw Material Purchases (Operating Expenses)
        $purchases = Purchase::whereYear('purchase_date', $year)
                             ->whereMonth('purchase_date', $phpMonth)
                             ->sum('total_amount');

        // Total Operating Expenses (Nómina + Insumos)
        $operatingExpenses = $payroll + $purchases;

        // Profit = Revenue - Operating Expenses - Returns
        $profit = $totalRevenue - $operatingExpenses - $returns;

        return [
            'revenue' => $totalRevenue,
            'directSales' => $directSales,
            'creditRecovered' => $creditPayments,
            'returns' => $returns,
            'payroll' => $payroll,
            'purchases' => $purchases,
            'operatingExpenses' => $operatingExpenses, // Combined
            'profit' => $profit
        ];
    }
}
