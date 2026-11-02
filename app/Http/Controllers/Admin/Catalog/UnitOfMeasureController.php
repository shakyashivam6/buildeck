<?php

namespace App\Http\Controllers\Admin\Catalog;

use App\Http\Controllers\Controller;
use App\Models\UnitOfMeasure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitOfMeasureController extends Controller
{
    /**
     * Display a listing of UOMs.
     */
    public function index(): Response
    {
        $uoms = UnitOfMeasure::withCount('productPrices')
            ->orderBy('unit_category')
            ->orderBy('name')
            ->paginate(25);

        return Inertia::render('Admin/Catalog/Uom/index', [
            'uoms' => $uoms,
        ]);
    }

    /**
     * Store a newly created UOM.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:50', 'unique:units_of_measure,code'],
            'symbol' => ['required', 'string', 'max:20'],
            'unit_category' => ['required', 'in:mass,volume,area,length,discrete_pack,count'],
            'is_discrete' => ['boolean'],
        ]);

        UnitOfMeasure::create([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'symbol' => $validated['symbol'],
            'unit_category' => $validated['unit_category'],
            'is_discrete' => $validated['is_discrete'] ?? false,
        ]);

        return back()->with('success', 'Unit of Measure created successfully!');
    }

    /**
     * Update an existing UOM.
     */
    public function update(Request $request, UnitOfMeasure $uom): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'symbol' => ['required', 'string', 'max:20'],
            'unit_category' => ['required', 'in:mass,volume,area,length,discrete_pack,count'],
            'is_discrete' => ['boolean'],
        ]);

        $uom->update([
            'name' => $validated['name'],
            'symbol' => $validated['symbol'],
            'unit_category' => $validated['unit_category'],
            'is_discrete' => $validated['is_discrete'] ?? false,
        ]);

        return back()->with('success', 'Unit of Measure updated successfully!');
    }
}

