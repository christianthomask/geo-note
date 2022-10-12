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

onValue(postListRef, (snapshot) => {
    console.log('post')
})