<script>
    import Cookies from 'js-cookie'
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation'
    import { initializeApp } from "firebase/app";
    import {
        getAuth,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        onAuthStateChanged,
    } from "firebase/auth";
	import { getDatabase, ref, get, set } from 'firebase/database';
    import dayjs from 'dayjs'

    let signedIn = false;
    let wrongKey = false;
    let authState ="signIn";

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
    const auth = getAuth();
    const db = getDatabase();
    let key;
    get(ref(db, 'password')).then((snapshot) => {
        key = snapshot.val();
        // console.log(key);
    })

    // @TODO check if authcookie is a valid uid
    if(Cookies.get('authcookie') && Cookies.get('authcookie') !== 'false'){
        goto('/home');
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            const uid = user.uid;
            // window.location.replace("https://www.gnote.app/home");
            Cookies.set('authcookie', uid )
            // ...
        } else {
            // User is signed out
            Cookies.set('authcookie', 'false' )
        }
    });

    let deferredPrompt;

    function createUser() {
        const email = document.getElementById("createEmail").value;
        const password = document.getElementById("createPassword").value;
        const username = document.getElementById("createUsername").value;
        const checkKey = document.getElementById("genericPass").value;
        if (checkKey === key) {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    const newUserRef = ref(db, "users/" + user.uid);
                    set(newUserRef,{
                        username: username,
                        email: email,
                        password: password,
                        createDate: dayjs().format('MM-DD-YYYY')
                    })
                    // window.location.replace("https://www.gnote.app/home");
                    authState = 'unset';
                    signedIn = true;
                })
                .catch((error) => {
                    console.log(error.code);
                    console.log(error.message);
                    // ..
                });
        }else if (checkKey !== key) {
            wrongKey = true;
            setTimeout(() => {
                wrongKey = false;
            }, 500)
        }
        document.getElementById("createEmail").value = "";
        document.getElementById("createPassword").value = "";
        document.getElementById("genericPass").value = "";
    }
    
    function signInUser(){
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // window.location.replace("https://www.gnote.app/home");
            goto('/home');
        })
        .catch((error) => {
            console.log(error.code);
            console.log(error.message);
        });
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
     }

    async function installApp() {
        if (deferredPrompt !== null) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                deferredPrompt = null;
            }
        }
    }


     

    onMount(() => {

        window.addEventListener('beforeinstallprompt', (e) => {
            deferredPrompt = e;
        });

    });


</script>



<div class="bg-slate-100 w-full h-screen fixed flex flex-col gap-y-2 pt-2 items-center">
    {#if wrongKey}
        <div class="w-full max-w-sm h-full max-h-sm rounded-md text-gray-50 text-lg leading-7 font-extrabold bg-gray-500/50 flex justify-center items-center absolute">Invalid Key</div>
    {/if}
    {#if !signedIn && authState ==="signIn"}
        <div class="bg-slate-200 w-fit max-w-sm h-fit rounded-md p-6 flex flex-col gap-4">
            <h1 class="text-lg leading-7 font-extrabold">Hi! 👋</h1>
            <h2 class="text-lg leading-7 font-medium">Welcome to GeoNote, also known as gNote!</h2>
            <input class="rounded-md" type="email" id="email" placeholder="Email">
            <input class="rounded-md" type="password" id="password" placeholder="Password">
              <div class="w-full flex justify-center">
                <div class="cursor-pointer w-fit h-fit px-8 py-2 bg-yellow-300 rounded-lg text-lg leading-7 font-extrabold" on:click={signInUser}>
                    Sign In
                </div>
            </div>
        </div>
        <p class=" cursor-pointer text-lg leading-7 font-medium text-blue-500" on:click={() => {authState="createUser"}}>Create Account?</p>
    {/if}
    {#if !signedIn && authState ==="createUser"}
        <div class="bg-slate-200 w-fit max-w-sm h-fit rounded-md p-6 flex flex-col gap-4">
            <h1 class="text-lg leading-7 font-extrabold">Hi! 👋</h1>
            <h2 class="text-lg leading-7 font-medium">Welcome to GeoNote, also known as gNote!</h2>
            <input class="rounded-md" type="email" id="createEmail" placeholder="Email">
            <input class="rounded-md" type="password" id="createPassword" placeholder="Password">
            <input class="rounded-md" type="text" id="createUsername" placeholder="Username">
            <input class="rounded-md" type="password" id="genericPass" placeholder="Invite Key">
              <div class="w-full flex justify-center">
                <div class="cursor-pointer w-fit h-fit px-8 py-2 bg-yellow-300 rounded-lg text-lg leading-7 font-extrabold" on:click={createUser}>
                    Create User
                </div>
            </div>
        </div>
        <p class=" cursor-pointer text-lg leading-7 font-medium text-blue-500" on:click={() => {authState="signIn"}}>Sign In?</p>
    {/if}
    {#if signedIn}
        <div class="bg-slate-200 w-fit max-w-sm h-fit rounded-md p-6 flex flex-col gap-4">
            <p class="">This app works best when installed, if you'd like to give it a whirl, tap below!</p>
            <div class="w-full flex justify-center">
                <div class="cursor-pointer w-fit h-fit px-8 py-2 bg-yellow-300 rounded-lg text-lg leading-7 font-extrabold" on:click={installApp}>
                    Install App
                </div>
            </div>
            <p class="">Or if you're on iOS tap <img class="inline" src="ios-share.svg" alt="Share"> and select 'Add to Homescreen'</p>
        </div>
    {/if}
</div>