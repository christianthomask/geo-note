<script>

    import { onMount } from 'svelte';
    import { initializeApp } from "firebase/app";
    import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,} from "firebase/auth";
	import { get } from 'firebase/database';
	import { connectStorageEmulator } from 'firebase/storage';

    let signedIn;

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
    function createUser(){
        const email = document.getElementById("createEmail").value;
        const password = document.getElementById("createPassword").value;
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        });

    }
    
    function signInUser(){
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
     }


     

    onMount(() => {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            deferredPrompt = e;
        });

        const installApp = document.getElementById('installApp');
        const signIn = document.getElementById('signIn');


        // installApp.addEventListener('click', async () => {
        //     if (deferredPrompt !== null) {
        //         deferredPrompt.prompt();
        //         const { outcome } = await deferredPrompt.userChoice;
        //         if (outcome === 'accepted') {
        //             deferredPrompt = null;
        //         }
        //     }
        // });
    })


</script>



<div class="bg-slate-100 w-full h-screen fixed flex flex-col gap-y-2 justify-center items-center">
    {#if !signedIn && authState ==="signIn"}
        <div class="bg-slate-200 w-fit max-w-sm h-fit rounded-md p-6 flex flex-col gap-4">
            <h1 class="text-lg leading-7 font-extrabold">Hi! 👋</h1>
            <h2 class="text-lg leading-7 font-medium">Welcome to GeoNote, also known as gNote!</h2>
            <input type="text" id="email" placeholder="Email">
            <input type="text" id="password" placeholder="Password">
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
            <input type="text" id="createEmail" placeholder="Email">
            <input type="text" id="createPassword" placeholder="Password">
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
            <h1 class="text-lg leading-7 font-extrabold">Hi! 👋</h1>
            <p class="">Welcome to GeoNote, also know as gNote! This app works best when installed, if you'd like to give it a whirl, tap below!</p>
            <div class="w-full flex justify-center">
                <div class="cursor-pointer w-fit h-fit px-8 py-2 bg-yellow-300 rounded-lg text-lg leading-7 font-extrabold" id="installApp">
                    Install App
                </div>
            </div>
        </div>
    {/if}
</div>