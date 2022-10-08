<script>
    import { onMount } from 'svelte'
    import { Map, NavigationControl, GeolocateControl, Marker } from 'maplibre-gl';
    import 'maplibre-gl/dist/maplibre-gl.css';

    let map;
    let mapContainer;

    onMount(() => {

        const apiKey = '3lyTBC440REMO3MblUAD';

        const initialState = { lng: 0, lat: 0, zoom: 14 };

        map = new Map({
            container: mapContainer,
            style: `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`,
            center: [initialState.lng, initialState.lat],
            zoom: initialState.zoom
        });

        let geolocate = new GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showAccuracyCircle: false,
        });
        map.addControl(geolocate);
        map.on('load', () => {
            geolocate.trigger();
        })

    });
</script>

<div class="w-full h-1/2">
    <div class="map" id="map" bind:this={mapContainer}></div>
</div>

<style>
    .map {
        width: 100%;
        height: 100%;
    }
</style>