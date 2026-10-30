<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;

class ApiSupportController extends Controller
{
    /**
     * Get states list for registration dropdowns.
     */
    public function getStates(): JsonResponse
    {
        $states = Location::where('parent_id', 1)
            ->where('status', '1')
            ->orderBy('name', 'asc')
            ->get(['id', 'name']);

        return response()->json([
            'auth_status' => false,
            'res' => 'success',
            'msg' => 'States fetched successfully.',
            'data' => $states,
            'token_type' => 'Bearer',
        ], 200);
    }

    /**
     * Get cities list by state ID.
     */
    public function getCities(int $stateId): JsonResponse
    {
        $cities = Location::where('parent_id', $stateId)
            ->where('status', '1')
            ->orderBy('name', 'asc')
            ->get(['id', 'name']);

        return response()->json([
            'auth_status' => false,
            'res' => 'success',
            'msg' => 'Cities fetched successfully.',
            'data' => $cities,
            'token_type' => 'Bearer',
        ], 200);
    }
}
