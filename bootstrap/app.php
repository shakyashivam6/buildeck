<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Prepend ForceJsonResponse to ensure API requests always return JSON
        $middleware->api(prepend: [
            ForceJsonResponse::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // 1. Unauthenticated API Exception (401 - Never redirect to login)
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'auth_status' => false,
                    'res' => 'error',
                    'msg' => 'Unauthenticated or session expired. Please login again.',
                    'token_type' => 'Bearer',
                    'data' => [],
                ], 401);
            }
        });

        // 2. Not Found API Exception (404 - Clean JSON instead of HTML 404 page)
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'auth_status' => true,
                    'res' => 'error',
                    'msg' => 'The requested API endpoint or resource was not found.',
                    'token_type' => 'Bearer',
                    'data' => [],
                ], 404);
            }
        });

        // 3. Validation Exception fallback for APIs (422)
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'auth_status' => true,
                    'res' => 'error',
                    'msg' => $e->validator->errors()->first(),
                    'token_type' => 'Bearer',
                    'data' => $e->validator->errors(),
                ], 422);
            }
        });
    })->create();
