<?php

namespace App\Services;

class GoogleMapsService
{
    /**
     * Create a new Google Maps service instance.
     */
    public function __construct(
        protected ?string $apiKey = null
    ) {
        $this->apiKey = $apiKey ?? (string) config('services.google_maps.api_key', '');
    }

    /**
     * Get the Google Maps API key.
     */
    public function getApiKey(): ?string
    {
        return $this->apiKey;
    }

    /**
     * Determine whether the Google Maps API key is configured.
     */
    public function hasApiKey(): bool
    {
        return !empty($this->apiKey);
    }
}
