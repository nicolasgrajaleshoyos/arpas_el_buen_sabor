<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PurchaseController;

// Redirect root to login
Route::get('/', function () {
    return redirect()->route('login');
});

// Login route
Route::get('/login', function () {
    return view('auth.login');
})->name('login');

// Dashboard routes
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/inventory', [DashboardController::class, 'inventory'])->name('inventory');
Route::get('/sales', [DashboardController::class, 'sales'])->name('sales');
Route::get('/raw-materials', [DashboardController::class, 'rawMaterials'])->name('raw-materials');
Route::get('/suppliers', [DashboardController::class, 'suppliers'])->name('suppliers');
Route::get('/hr', [DashboardController::class, 'hr'])->name('hr');
Route::get('/returns', function () {
    return view('modules.returns');
})->name('returns');
Route::get('/settings', [DashboardController::class, 'settings'])->name('settings');
Route::resource('purchases', PurchaseController::class);
Route::post('/migrate-data', [App\Http\Controllers\DataMigrationController::class, 'migrate'])->name('migrate-data');
Route::get('/migration-tool', function () {
    return view('modules.migration-tool');
})->name('migration-tool');

Route::get('/api/suppliers', [App\Http\Controllers\Api\SupplierController::class, 'index'])->name('api.suppliers.index');
Route::post('/api/suppliers', [App\Http\Controllers\Api\SupplierController::class, 'store'])->name('api.suppliers.store');
Route::put('/api/suppliers/{id}', [App\Http\Controllers\Api\SupplierController::class, 'update'])->name('api.suppliers.update');
Route::delete('/api/suppliers/{id}', [App\Http\Controllers\Api\SupplierController::class, 'destroy'])->name('api.suppliers.destroy');

Route::apiResource('api/products', App\Http\Controllers\Api\ProductController::class);

Route::get('/api/raw-materials', [App\Http\Controllers\Api\RawMaterialController::class, 'index'])->name('api.raw-materials.index');
Route::post('/api/raw-materials', [App\Http\Controllers\Api\RawMaterialController::class, 'store'])->name('api.raw-materials.store');
Route::put('/api/raw-materials/{id}', [App\Http\Controllers\Api\RawMaterialController::class, 'update'])->name('api.raw-materials.update');
Route::delete('/api/raw-materials/{id}', [App\Http\Controllers\Api\RawMaterialController::class, 'destroy'])->name('api.raw-materials.destroy');

Route::get('/api/material-transactions', [App\Http\Controllers\Api\MaterialTransactionController::class, 'index'])->name('api.material-transactions.index');
Route::post('/api/material-transactions', [App\Http\Controllers\Api\MaterialTransactionController::class, 'store'])->name('api.material-transactions.store');
Route::delete('/api/material-transactions/{id}', [App\Http\Controllers\Api\MaterialTransactionController::class, 'destroy'])->name('api.material-transactions.destroy');

// HR API Routes
Route::apiResource('api/employees', App\Http\Controllers\Api\EmployeeController::class);
Route::apiResource('api/employee-advances', App\Http\Controllers\Api\EmployeeAdvanceController::class);
Route::apiResource('api/payrolls', App\Http\Controllers\Api\PayrollController::class);
Route::apiResource('api/sales', App\Http\Controllers\Api\SaleController::class);
Route::apiResource('api/inventory-movements', App\Http\Controllers\Api\InventoryMovementController::class);

// Credits Module
Route::get('/credits', function () {
    return view('modules.credits');
})->name('credits');

Route::apiResource('api/credits', App\Http\Controllers\Api\CreditController::class);
Route::post('api/credits/{id}/payments', [App\Http\Controllers\Api\CreditController::class, 'addPayment']);

Route::get('/api/dashboard/stats', [App\Http\Controllers\Api\DashboardStatsController::class, 'index']);


