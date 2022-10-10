<script>

    import { initializeApp } from "firebase/app";
    import { getDatabase, ref as fireRef, set, push } from "firebase/database";
    import { onMount } from 'svelte';

    let loc
    let lat = '0'
    let lng = '0'
    onMount(() => {
        loc = window.navigator;
    });

    let posting = false;

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


    let feedExpandedState = {state: 'feed', class:"h-1/2", width:"w-40"};
    function togglePostState() {
        if (feedExpandedState.state === 'feed') {
            feedExpandedState.class = "h-full";
            feedExpandedState.state = 'post';
            feedExpandedState.width = "w-10";
        } else if (feedExpandedState.state === 'post') {
            feedExpandedState.class = "h-1/2";
            feedExpandedState.state = 'feed';
            feedExpandedState.width = "w-40";
        }
    }

    let getLocationPromise = () => {
        return new Promise(function (resolve, reject) {
            loc.geolocation.getCurrentPosition(
                (position) => resolve(position),
                (error) => reject(error)
            );
        });
    }


    function submitPost() {
        posting = true;
        getLocationPromise()
            .then((res) => {
                // console.log('run')
                const { coords } = res;
                lat = coords.latitude
                lng = coords.longitude
                let post = document.getElementById('post').value
                const postListRef = fireRef(db, '/posts');
                const newPostRef = push(postListRef);
                set(newPostRef, {
                    user: 'Christian',
                    lat: lat,
                    lng: lng,
                    content: post
                });
                posting = false;
                togglePostState();
            })
    }

</script>

<div class="relative z-20 bottom-3 w-full max-w-3xl {feedExpandedState.class} flex flex-col bg-slate-100 transition-height duration-500 ease-in-out overflow-x-hidden">
    <div class="w-full flex items-center justify-between bg-slate-200">
       <div class="flex items-center gap-x-3 p-3">
           <img src="/logo.svg" alt="logo">
           <p class="text-lg leading-7 font-extrabold">:GeoNote</p>
       </div>
       <div class="h-full {feedExpandedState.width} items-center p-2.5 gap-x-2.5 flex bg-yellow-300 cursor-pointer transition-all duration-200" on:click={togglePostState}>
           {#if feedExpandedState.state === 'feed'}
               <img class="h-2/3" src="/add-line.svg" alt="add">
           {/if}
           {#if feedExpandedState.state === 'post'}
               <img class="h-2/3" src="/close-circle-fill.svg" alt="close">
           {/if}
           {#if feedExpandedState.state === 'feed'}
                <p class="text-lg leading-7 font-extrabold min-w-max">Add a Note</p>
           {/if}
       </div>
    </div>
    {#if feedExpandedState.state === 'post'}
        <div class="w-full h-full flex flex-col items-center p-8 pb-16">
            <textarea id="post" class="rounded-tl-lg rounded-tr-lg w-full h-full border-none" style="resize: none;"></textarea>
            <div class="w-full h-fit bg-white rounded-bl-lg rounded-br-lg flex justify-end">
                <button class="w-fit p-2.5 bg-yellow-300 rounded-tl-lg rounded-br-lg flex gap-x-1 items-center" on:click={submitPost}>
                    <img class="h-2/3" src="/map-pin-fill.svg" alt="pin">
                    Pin
                </button>
            </div>
        </div>
    {/if}
    {#if posting}
        <div class="absolute top-0 left-0 w-full h-full bg-slate-500/50 flex items-center justify-center">
            <p class="text-white">Posting...</p>
        </div>
    {/if}
</div>