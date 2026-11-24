<?php

namespace App\Providers;

use App\Services\GoogleMapsService;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(GoogleMapsService::class, function (): GoogleMapsService {
            return new GoogleMapsService(
                apiKey: config('services.google_maps.api_key')
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
