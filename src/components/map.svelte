<script>
    import { onMount } from 'svelte'
    import { Map, NavigationControl, GeolocateControl, Marker } from 'maplibre-gl';
    import 'maplibre-gl/dist/maplibre-gl.css';
    import { getDatabase, ref as fireRef, onValue} from "firebase/database";
    import {initializeApp} from "firebase/app";

    let map;
    let mapContainer;
    let postObj;
    let currentPosts = [];

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

        setInterval(refreshMap, 500);

    });

    const firebaseConfig = {
        apiKey: "AIzaSyBbaLefwpOcEG1dewjTeXJroUDr7TCuNLU",
        authDomain: "geo-note-1c91e.firebaseapp.com",
        databaseURL: "https://geo-note-1c91e-default-rtdb.firebaseio.com",
        projectId: "geo-note-1c91e",
        storageBucket: "geo-note-1c91e.appspot.com",
        messagingSenderId: "159681001749",
        appId: "1:159681001749:web:f3a7cbcbc37727b81d911c",
        measurementId: "G-FZXPD3189K"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app)

    const postRef = fireRef(db, '/posts');
    onValue(postRef, (snapshot) => {
        const data = snapshot.val()
        postObj = data;
        // console.log(postObj)
    })

    function refreshMap() {
        const count = currentPosts.length;
        if (count !== 0 && postObj !== null) {
            Object.entries(postObj).forEach((entry) => {
                for(let i=0;i<count;i++) {
                    // console.log(entry[1].lat)
                    // console.log(entry[1].lng)
                    if (currentPosts[i] !== entry[0]) {
                        new Marker()
                            .setLngLat([entry[1].lat, entry[1].lng])
                            .addTo(map);
                        currentPosts.push(entry[0])
                    }
                }
            })
        } else if (postObj !== null) {
            Object.entries(postObj).forEach((entry) => {
                // console.log(entry[1].lat)
                // console.log(entry[1].lng)
                new Marker()
                    .setLngLat([entry[1].lng, entry[1].lat])
                    .addTo(map);
                currentPosts.push(entry[0])
            })
        }
    }

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