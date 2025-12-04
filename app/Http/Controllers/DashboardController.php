<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        return view('modules.dashboard');
    }

    public function inventory()
    {
        return view('modules.inventory');
    }

    public function sales()
    {
        return view('modules.sales');
    }

    public function rawMaterials()
    {
        return view('modules.raw-materials');
    }

    public function suppliers()
    {
        return view('modules.suppliers');
    }

    public function hr()
    {
        return view('modules.hr');
    }

    public function settings()
    {
        return view('modules.settings');
    }
}
