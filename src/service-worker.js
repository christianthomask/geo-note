import {getDatabase, ref as fireRef, onValue} from "firebase/database";
import {initializeApp} from "firebase/app";


self.addEventListener('install', (event) => {
    console.log('sw install')
})

self.addEventListener('activate', (event) => {
    console.log('sw activated')
})

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
const postListRef = fireRef(db, '/posts');

let nPerm;
let localPosts;

onmessage = (event) => {
    if (event.data.tag === "perm") {
        nPerm = event.data.package;
    } else if (event.data.tag === "posts") {
        localPosts = event.data.package;
    }
}

onValue(postListRef, (snapshot) => {
    console.log('post')
    let posts = snapshot.val();

    Object.entries(posts).forEach((entry) => {
        if(nPerm === 'granted' && localPosts[entry[0]] !== 'true') {
            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(entry[1].user + " pinned a note nearby!", {
                    body: "Tap to see more...",
                    vibrate: [200, 100, 200, 100, 200, 100, 200],
                    data: {post: entry[0]},
                })
            })
        }
    })
})