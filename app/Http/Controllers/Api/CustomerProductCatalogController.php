<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CustomerCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerProductCatalogController extends Controller
{
    public function __construct(
        protected CustomerCatalogService $catalogService
    ) {}

    /**
     * Standard JSON success response helper.
     */
    protected function successResponse(string $message, mixed $data = [], int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'auth_status' => true,
            'res' => 'success',
            'msg' => $message,
            'token_type' => 'Bearer',
            'data' => $data,
        ], $statusCode);
    }

    /**
     * Standard JSON error response helper.
     */
    protected function errorResponse(string $message, int $statusCode = 422, mixed $data = []): JsonResponse
    {
        return response()->json([
            'auth_status' => true,
            'res' => 'error',
            'msg' => $message,
            'token_type' => 'Bearer',
            'data' => $data,
        ], $statusCode);
    }

    /**
     * Get geo-located items catalog for customers based on coordinates.
     *
     * GET /api/customer/catalog?lat=26.38967&long=80.48587346&search=cement&category_id=1
     */
    public function catalog(Request $request): JsonResponse
    {
        $coords = CustomerCatalogService::parseCoordinates(
            $request->input('lat'),
            $request->input('long'),
            $request->input('latlong')
        );

        // Fallback to authenticated user's coordinates if not passed in query
        if (! $coords && $request->user()) {
            $user = $request->user();
            if ($user->lat !== null && $user->long !== null) {
                $coords = [
                    'lat' => (float) $user->lat,
                    'long' => (float) $user->long,
                ];
            }
        }

        $categoryId = $request->integer('category_id') ?: null;
        $search = $request->string('search')->toString() ?: null;

        $items = $this->catalogService->getNearbyItems(
            $coords['lat'] ?? null,
            $coords['long'] ?? null,
            $categoryId,
            $search
        );

        return $this->successResponse('Nearby items fetched successfully.', [
            'customer_location' => $coords,
            'total_items' => count($items),
            'items' => $items,
        ]);
    }

    /**
     * Get complete product details and list of all nearby vendors providing this item.
     *
     * GET /api/customer/products/{productId}?lat=26.38967&long=80.48587346
     */
    public function productDetails(Request $request, int $productId): JsonResponse
    {
        $coords = CustomerCatalogService::parseCoordinates(
            $request->input('lat'),
            $request->input('long'),
            $request->input('latlong')
        );

        // Fallback to authenticated user's coordinates if not passed in query
        if (! $coords && $request->user()) {
            $user = $request->user();
            if ($user->lat !== null && $user->long !== null) {
                $coords = [
                    'lat' => (float) $user->lat,
                    'long' => (float) $user->long,
                ];
            }
        }

        $details = $this->catalogService->getItemDetailsWithNearbyVendors(
            $productId,
            $coords['lat'] ?? null,
            $coords['long'] ?? null
        );

        if (! $details) {
            return $this->errorResponse('Product not found or currently inactive.', 404);
        }

        $details['customer_location'] = $coords;

        return $this->successResponse('Product details and nearby vendors loaded.', $details);
    }
}
