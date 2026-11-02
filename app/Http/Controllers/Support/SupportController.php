<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;

class SupportController extends Controller
{
    /**
     * Get active states collection (Controllers me reuse karne ke liye).
     */
    public static function getStatesList()
    {
        return Location::where('parent_id', 1)
            ->where('status', '1')
            ->orderBy('name', 'asc')
            ->get(['id', 'name']);
    }

    /**
     * States JSON endpoint (agar AJAX/API se fetch karna ho).
     */
    public function getStates(): JsonResponse
    {
        return response()->json(self::getStatesList());
    }

    /**
     * Cities JSON endpoint by state ID.
     */
    public function getCities(int $stateId): JsonResponse
    {
        $cities = Location::where('parent_id', $stateId)
            ->where('status', '1')
            ->orderBy('name', 'asc')
            ->get(['id', 'name']);

        return response()->json($cities);
    }
}