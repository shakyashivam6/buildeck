import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * GoogleMapPicker component provides:
 * 1. Interactive Google Map with draggable marker & click-to-pin
 * 2. Location search via Google Places Autocomplete
 * 3. One-click "Fetch Current Location" using Browser Geolocation
 * 4. Optional visual Supply Radius circle (in KM)
 * 5. Reverse geocoding to suggest address and postal code
 */
export default function GoogleMapPicker({
    apiKey = '',
    lat = '',
    lng = '',
    radius = '',
    onLocationSelect,
    onAddressSelect,
    height = '360px',
}) {
    const mapContainerRef = useRef(null);
    const searchInputRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const circleRef = useRef(null);
    const autocompleteRef = useRef(null);
    const geocoderRef = useRef(null);

    const [scriptStatus, setScriptStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [locationMessage, setLocationMessage] = useState(null);
    const [selectedAddressPreview, setSelectedAddressPreview] = useState('');

    const numericLat = parseFloat(lat);
    const numericLng = parseFloat(lng);
    const hasValidCoords = !isNaN(numericLat) && !isNaN(numericLng) && numericLat !== 0 && numericLng !== 0;

    // 1. Load Google Maps Script
    useEffect(() => {
        if (!apiKey) {
            setScriptStatus('no_key');
            return;
        }

        if (window.google && window.google.maps && window.google.maps.places) {
            setScriptStatus('ready');
            return;
        }

        const existingScript = document.getElementById('google-maps-api-script');
        if (existingScript) {
            const handleLoad = () => setScriptStatus('ready');
            const handleError = () => setScriptStatus('error');
            existingScript.addEventListener('load', handleLoad);
            existingScript.addEventListener('error', handleError);

            if (window.google && window.google.maps) {
                setScriptStatus('ready');
            }
            return () => {
                existingScript.removeEventListener('load', handleLoad);
                existingScript.removeEventListener('error', handleError);
            };
        }

        const script = document.createElement('script');
        script.id = 'google-maps-api-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => setScriptStatus('ready');
        script.onerror = () => setScriptStatus('error');

        document.head.appendChild(script);
    }, [apiKey]);

    // Reverse geocoding helper
    const reverseGeocode = useCallback((latitude, longitude) => {
        if (!geocoderRef.current && window.google?.maps?.Geocoder) {
            geocoderRef.current = new window.google.maps.Geocoder();
        }
        if (!geocoderRef.current) return;

        geocoderRef.current.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const place = results[0];
                setSelectedAddressPreview(place.formatted_address || '');

                if (onAddressSelect) {
                    let pincode = '';
                    let city = '';
                    let state = '';

                    place.address_components?.forEach((component) => {
                        const types = component.types || [];
                        if (types.includes('postal_code')) {
                            pincode = component.long_name;
                        }
                        if (types.includes('locality')) {
                            city = component.long_name;
                        }
                        if (types.includes('administrative_area_level_1')) {
                            state = component.long_name;
                        }
                    });

                    onAddressSelect({
                        formattedAddress: place.formatted_address,
                        pincode,
                        city,
                        state,
                    });
                }
            }
        });
    }, [onAddressSelect]);

    // Handle coordinate selection
    const updateCoordinates = useCallback((newLat, newLng, shouldReverseGeocode = true) => {
        const roundedLat = parseFloat(newLat.toFixed(7));
        const roundedLng = parseFloat(newLng.toFixed(7));

        if (onLocationSelect) {
            onLocationSelect(roundedLat, roundedLng);
        }

        if (shouldReverseGeocode) {
            reverseGeocode(roundedLat, roundedLng);
        }
    }, [onLocationSelect, reverseGeocode]);

    // 2. Initialize Google Map
    useEffect(() => {
        if (scriptStatus !== 'ready' || !mapContainerRef.current || mapInstanceRef.current) {
            return;
        }

        const initialCenter = hasValidCoords
            ? { lat: numericLat, lng: numericLng }
            : { lat: 20.5937, lng: 78.9629 }; // Default: India

        const map = new window.google.maps.Map(mapContainerRef.current, {
            center: initialCenter,
            zoom: hasValidCoords ? 15 : 5,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                position: window.google.maps.ControlPosition.TOP_RIGHT,
            },
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
        });

        mapInstanceRef.current = map;
        geocoderRef.current = new window.google.maps.Geocoder();

        // Marker
        const marker = new window.google.maps.Marker({
            position: hasValidCoords ? initialCenter : null,
            map: hasValidCoords ? map : null,
            draggable: true,
            animation: window.google.maps.Animation.DROP,
            title: "Selected Location",
        });
        markerRef.current = marker;

        // Marker dragend listener
        marker.addListener('dragend', () => {
            const position = marker.getPosition();
            if (position) {
                updateCoordinates(position.lat(), position.lng(), true);
            }
        });

        // Map click listener
        map.addListener('click', (e) => {
            if (!e.latLng) return;
            const clickedLat = e.latLng.lat();
            const clickedLng = e.latLng.lng();

            marker.setPosition(e.latLng);
            if (!marker.getMap()) {
                marker.setMap(map);
            }

            updateCoordinates(clickedLat, clickedLng, true);
        });

        // Initialize Places Autocomplete
        if (searchInputRef.current && window.google.maps.places) {
            const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
                fields: ['geometry', 'formatted_address', 'address_components', 'name'],
            });
            autocomplete.bindTo('bounds', map);
            autocompleteRef.current = autocomplete;

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (!place.geometry || !place.geometry.location) {
                    return;
                }

                const placeLat = place.geometry.location.lat();
                const placeLng = place.geometry.location.lng();

                map.setCenter(place.geometry.location);
                map.setZoom(16);

                marker.setPosition(place.geometry.location);
                if (!marker.getMap()) {
                    marker.setMap(map);
                }

                setSelectedAddressPreview(place.formatted_address || place.name || '');
                updateCoordinates(placeLat, placeLng, false);

                // Pass address details if available
                if (onAddressSelect && (place.formatted_address || place.address_components)) {
                    let pincode = '';
                    let city = '';
                    let state = '';

                    place.address_components?.forEach((component) => {
                        const types = component.types || [];
                        if (types.includes('postal_code')) pincode = component.long_name;
                        if (types.includes('locality')) city = component.long_name;
                        if (types.includes('administrative_area_level_1')) state = component.long_name;
                    });

                    onAddressSelect({
                        formattedAddress: place.formatted_address || place.name,
                        pincode,
                        city,
                        state,
                    });
                }
            });
        }
    }, [scriptStatus, updateCoordinates, onAddressSelect]);

    // 3. Sync external lat / lng updates with Marker & Map Center
    useEffect(() => {
        if (!mapInstanceRef.current || !markerRef.current || !hasValidCoords) {
            return;
        }

        const currentMarkerPos = markerRef.current.getPosition();
        const diffLat = currentMarkerPos ? Math.abs(currentMarkerPos.lat() - numericLat) : 999;
        const diffLng = currentMarkerPos ? Math.abs(currentMarkerPos.lng() - numericLng) : 999;

        // If coordinates changed significantly from current marker
        if (diffLat > 0.00001 || diffLng > 0.00001) {
            const newPos = new window.google.maps.LatLng(numericLat, numericLng);
            markerRef.current.setPosition(newPos);
            if (!markerRef.current.getMap()) {
                markerRef.current.setMap(mapInstanceRef.current);
            }
            mapInstanceRef.current.panTo(newPos);
            if (mapInstanceRef.current.getZoom() < 14) {
                mapInstanceRef.current.setZoom(15);
            }
        }
    }, [numericLat, numericLng, hasValidCoords]);

    // 4. Visual Supply Radius Circle
    useEffect(() => {
        if (!mapInstanceRef.current || !markerRef.current) return;

        const numRadiusKm = parseFloat(radius);
        if (!isNaN(numRadiusKm) && numRadiusKm > 0 && hasValidCoords) {
            const radiusInMeters = numRadiusKm * 1000;
            const center = { lat: numericLat, lng: numericLng };

            if (!circleRef.current) {
                circleRef.current = new window.google.maps.Circle({
                    map: mapInstanceRef.current,
                    center,
                    radius: radiusInMeters,
                    fillColor: '#0d6efd',
                    fillOpacity: 0.12,
                    strokeColor: '#0d6efd',
                    strokeOpacity: 0.7,
                    strokeWeight: 1.5,
                });
            } else {
                circleRef.current.setCenter(center);
                circleRef.current.setRadius(radiusInMeters);
                circleRef.current.setMap(mapInstanceRef.current);
            }
        } else if (circleRef.current) {
            circleRef.current.setMap(null);
        }
    }, [radius, numericLat, numericLng, hasValidCoords]);

    // 5. "Fetch Current Location" Action
    const handleFetchCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationMessage({
                type: 'danger',
                text: 'Geolocation is not supported by your current browser.',
            });
            return;
        }

        setFetchingLocation(true);
        setLocationMessage(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentLat = position.coords.latitude;
                const currentLng = position.coords.longitude;

                setFetchingLocation(false);
                setLocationMessage({
                    type: 'success',
                    text: `Current location detected (Accuracy: ±${Math.round(position.coords.accuracy)}m)`,
                });

                if (mapInstanceRef.current && markerRef.current) {
                    const latLng = new window.google.maps.LatLng(currentLat, currentLng);
                    mapInstanceRef.current.setCenter(latLng);
                    mapInstanceRef.current.setZoom(16);

                    markerRef.current.setPosition(latLng);
                    if (!markerRef.current.getMap()) {
                        markerRef.current.setMap(mapInstanceRef.current);
                    }
                }

                updateCoordinates(currentLat, currentLng, true);
            },
            (error) => {
                setFetchingLocation(false);
                let message = 'Unable to fetch current location.';
                if (error.code === error.PERMISSION_DENIED) {
                    message = 'Location access permission was denied by your browser. Please allow location access in browser settings.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    message = 'Location information is unavailable.';
                } else if (error.code === error.TIMEOUT) {
                    message = 'Location request timed out. Please try again.';
                }

                setLocationMessage({
                    type: 'danger',
                    text: message,
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 0,
            }
        );
    };

    return (
        <div className="google-map-picker border rounded-3 p-2 bg-light mb-2">
            {/* Search Bar & Geolocation Header */}
            <div className="row g-2 align-items-center mb-2">
                <div className="col-md-8 col-sm-12">
                    <div className="input-group input-group-sm">
                        <span className="input-group-text bg-white">
                            <i className="ri-search-line text-muted"></i>
                        </span>
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="form-control"
                            placeholder="Search area, landmark or street address..."
                            disabled={scriptStatus !== 'ready'}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="col-md-4 col-sm-12 d-flex justify-content-md-end">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center w-100"
                        onClick={handleFetchCurrentLocation}
                        disabled={fetchingLocation || scriptStatus !== 'ready'}
                        title="Detect and use current device location"
                    >
                        {fetchingLocation ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                Fetching Location...
                            </>
                        ) : (
                            <>
                                <i className="ri-crosshair-2-line me-1 fs-14"></i>
                                Fetch Current Location
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Notification / Feedback Alerts */}
            {locationMessage && (
                <div className={`alert alert-${locationMessage.type} alert-dismissible py-1 px-2 fs-12 mb-2 fade show`} role="alert">
                    <i className={locationMessage.type === 'success' ? 'ri-check-line me-1' : 'ri-error-warning-line me-1'}></i>
                    {locationMessage.text}
                    <button
                        type="button"
                        className="btn-close p-1 fs-10"
                        onClick={() => setLocationMessage(null)}
                    ></button>
                </div>
            )}

            {/* Google Map Container / Status Banners */}
            <div className="position-relative rounded overflow-hidden" style={{ height, width: '100%', minHeight: '260px' }}>
                {scriptStatus === 'no_key' && (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-white text-muted p-3 text-center border">
                        <i className="ri-map-pin-warning-line fs-32 text-warning mb-2"></i>
                        <h6 className="mb-1 text-dark">Google Maps API Key Missing</h6>
                        <p className="fs-12 mb-2 text-muted">
                            Please configure <code>GOOGLE_MAPS_API_KEY</code> in your <code>.env</code> file.
                        </p>
                        <span className="badge bg-secondary-subtle text-secondary fs-11">
                            You can still enter Latitude and Longitude manually below.
                        </span>
                    </div>
                )}

                {scriptStatus === 'error' && (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-white text-muted p-3 text-center border">
                        <i className="ri-error-warning-line fs-32 text-danger mb-2"></i>
                        <h6 className="mb-1 text-danger">Failed to Load Google Maps</h6>
                        <p className="fs-12 mb-0 text-muted">
                            Please verify your API key restrictions and internet connection.
                        </p>
                    </div>
                )}

                {scriptStatus === 'loading' && (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-white text-muted p-3 text-center border">
                        <div className="spinner-border text-primary mb-2" role="status">
                            <span className="visually-hidden">Loading map...</span>
                        </div>
                        <span className="fs-12">Loading Google Maps...</span>
                    </div>
                )}

                <div
                    ref={mapContainerRef}
                    style={{
                        height: '100%',
                        width: '100%',
                        display: scriptStatus === 'ready' ? 'block' : 'none',
                    }}
                />
            </div>

            {/* Footer Status Bar */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 px-1 text-muted fs-11">
                <div>
                    <i className="ri-information-line me-1 text-info"></i>
                    Click anywhere on the map or drag the pin to set the exact vendor position.
                </div>
                {hasValidCoords && (
                    <div className="text-dark fw-medium mt-1 mt-md-0">
                        <i className="ri-map-pin-2-fill text-danger me-1"></i>
                        Lat: <span className="text-primary">{numericLat.toFixed(6)}</span>, Lng: <span className="text-primary">{numericLng.toFixed(6)}</span>
                    </div>
                )}
            </div>

            {/* Resolved Address Pill / Preview */}
            {selectedAddressPreview && (
                <div className="mt-1 px-1 fs-12 text-secondary d-flex align-items-center">
                    <i className="ri-building-line me-1 text-primary"></i>
                    <span className="text-truncate" title={selectedAddressPreview}>
                        <strong>Selected Area:</strong> {selectedAddressPreview}
                    </span>
                </div>
            )}
        </div>
    );
}
