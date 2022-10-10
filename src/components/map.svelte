<script>
    import { onMount } from 'svelte'
    import { Map, NavigationControl, GeolocateControl, Marker } from 'maplibre-gl';
    import 'maplibre-gl/dist/maplibre-gl.css';
    import { getDatabase, ref as fireRef, onValue } from "firebase/database";
    import { initializeApp } from "firebase/app";
    import { userLoc } from "../stores.js"

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
            zoom: initialState.zoom,
            interactive: false
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

        onValue(postRef, (snapshot) => {
            postObj = snapshot.val();
            refreshMap();
        })


        setInterval(refreshMap, 5000);
        geolocate.on('geolocate', (pos) => {
            // console.log(pos);
            userLoc.set(pos)
        })




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

    function refreshMap() {
        const count = currentPosts.length;
        if (count !== 0 && postObj !== null) {
            Object.entries(postObj).forEach((entry) => {
                let posted = false;
                currentPosts.forEach((post) => {
                    // console.log(entry[1].lat)
                    // console.log(entry[1].lng)
                    if (post === entry[0]) {
                        posted = true;
                    }
                })
                // console.log(posted);
                if (!posted) {
                    new Marker()
                        .setLngLat([entry[1].lng, entry[1].lat])
                        .addTo(map);
                    currentPosts.push(entry[0])
                }
            })
        } else if (count === 0 && postObj !== null) {
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

<div class="fixed w-full max-w-3xl h-1/2 m-auto transition-height duration-500 ease-in-out">
    <div class="map" id="map" bind:this={mapContainer}></div>
</div>

<style>
    .map {
        width: 100%;
        height: 100%;
    }
</style>