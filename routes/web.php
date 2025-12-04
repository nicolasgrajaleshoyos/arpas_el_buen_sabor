<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

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
Route::get('/settings', [DashboardController::class, 'settings'])->name('settings');
