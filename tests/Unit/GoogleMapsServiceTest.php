<?php

namespace Tests\Unit;

use App\Services\GoogleMapsService;
use Tests\TestCase;

class GoogleMapsServiceTest extends TestCase
{
    public function test_google_maps_service_resolves_from_container(): void
    {
        $service = app(GoogleMapsService::class);

        $this->assertInstanceOf(GoogleMapsService::class, $service);
        $this->assertEquals(config('services.google_maps.api_key'), $service->getApiKey());
    }

    public function test_has_api_key_returns_boolean(): void
    {
        $serviceWithKey = new GoogleMapsService('fake-key');
        $this->assertTrue($serviceWithKey->hasApiKey());
        $this->assertSame('fake-key', $serviceWithKey->getApiKey());

        $serviceWithoutKey = new GoogleMapsService('');
        $this->assertFalse($serviceWithoutKey->hasApiKey());
    }
}
