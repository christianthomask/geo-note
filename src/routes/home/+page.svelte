<script>
    import Map from "../../components/map.svelte"
    import { initializeApp } from "firebase/app";
    import {getDatabase, ref as fireRef, set, push, onValue} from "firebase/database";
    import { onMount } from 'svelte';
    import { posts, userLoc, notifPerm, feedState, cos } from "../../stores.js"

    let loc
    let lat = '0'
    let lng = '0'
    let currentPostId;
    let localPosts = {};
    posts.set({id: {loading: true}})

    let uiLogo;
    let uiCoS;
    let uiMenu;
    let uiPin;
    let uiPost;
    let uiPostClose;
    let uiComment;
    let uiAddPin;
    let uiSubmitPin;
    let uiAddPinClose;

    onMount(() => {
        loc = window.navigator;
        uiLogo = document.getElementById('logo');
        uiCoS = document.getElementById('cos');
        uiMenu = document.getElementById('menu');
        uiPin = document.getElementById('pin');
        uiPost = document.getElementById('post');
        uiPostClose = document.getElementById('postClose');
        uiComment = document.getElementById('comment');
        uiAddPin = document.getElementById('addPin');
        uiSubmitPin = document.getElementById('submitPin');
        uiAddPinClose = document.getElementById('addPinClose');
        uiInitAnim(uiMenu);
        uiInitAnim(uiPin);



        let mapTap =  feedState.subscribe((val) => {
            if(val !== 'unset') {
                console.log(val)
                openPost(val);
            }
        });

        // if ($notifPerm === 'unset') {
        //     Notification.requestPermission().then(perm => {
        //         notifPerm.set(perm);
        //         const pkg = {"tag": "perm", "package": perm}
        //         navigator.serviceWorker.controller.postMessage(pkg);
        //     })
        // }

        onValue(postListRef, (snapshot) => {
            // console.log('post');
            posts.set(snapshot.val());
            // console.log(posts);
            refreshFeed();
        })
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
    const postListRef = fireRef(db, '/posts');


    let feedExpandedState = {state: 'feed', class:"h-1/2", width:"w-40"};
    function togglePostState(state) {
        if (feedExpandedState.state === 'feed' && state !== 'post') {
            feedExpandedState.class = "h-3/5";
            feedExpandedState.state = 'add';
            feedExpandedState.width = "w-10";
        } else if (feedExpandedState.state === 'add' || feedExpandedState.state === 'post' && state !== 'post') {
            feedExpandedState.class = "h-1/2";
            feedExpandedState.state = 'feed';
            feedExpandedState.width = "w-40";
        } else if (state === 'post') {
            feedExpandedState.class = "h-3/5";
            feedExpandedState.state = 'post';
            feedExpandedState.width = "w-10";
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
                lat = coords.latitude;
                lng = coords.longitude;
                let post = document.getElementById('contents');
                const postContents = post.value;
                post.value = "";
                const newPostRef = push(postListRef);
                set(newPostRef, {
                    user: 'TestUser',
                    lat: lat,
                    lng: lng,
                    content: postContents
                });
                uiHide(uiAddPin)
                uiHide(uiPost)
                uiShrink(uiAddPinClose);
                uiInitAnim(uiMenu);
                uiInitAnim(uiPin);
                posting = false;
            })
    }

    function openPost(id) {
        currentPostId = id;
        uiShrink(uiMenu);
        uiShrink(uiPin);
        uiShow(uiPost);
        // togglePostState('post')
        if ($feedState !== 'unset') {
            feedState.set('unset');
        }
        uiInitAnim(uiPostClose);
        uiInitAnim(uiComment);
    }

    function closePost() {
        uiHide(uiPost)
        uiShrink(uiComment);
        uiShrink(uiPostClose);
        uiInitAnim(uiMenu);
        uiInitAnim(uiPin);
    }

    function enterPin() {
        uiShow(uiAddPin)
        uiInitAnim(uiAddPinClose)
        uiShrink(uiPin);
        uiShrink(uiMenu);
        uiShow(uiPost);
    }

    function exitPin() {
        uiHide(uiAddPin)
        uiHide(uiPost)
        uiShrink(uiAddPinClose);
        uiInitAnim(uiMenu);
        uiInitAnim(uiPin);
    }

    function refreshFeed() {
        // console.log(localPosts);
        // let listObj = {};
        // console.log(Object.entries($posts))
        Object.entries($posts).forEach((entry) => {
            // console.log(entry);
            // console.log(userLoc);
            const distance = findPinDistance($userLoc.coords.latitude, entry[1].lat, $userLoc.coords.longitude, entry[1].lng);
            if (distance < 1 && localPosts[entry[0]] === undefined) {
                localPosts[entry[0]] = entry[1]
                // console.log(listObj)
                // console.log(Object.entries($localPosts)[entry[0]])
            }
            // localPosts.set(listObj);
            // console.log($localPosts)
            // console.log(Object.entries($localPosts)[entry[0]])
            // postPostIds(localPosts);
            cachePostIds(localPosts);
        });
    }

    function findPinDistance(lat1, lat2, lon1, lon2) {

        // The math module contains a function
        // named toRadians which converts from
        // degrees to radians.
        lon1 =  lon1 * Math.PI / 180;
        lon2 = lon2 * Math.PI / 180;
        lat1 = lat1 * Math.PI / 180;
        lat2 = lat2 * Math.PI / 180;

        // Haversine formula
        let dlon = lon2 - lon1;
        let dlat = lat2 - lat1;
        let a = Math.pow(Math.sin(dlat / 2), 2)
            + Math.cos(lat1) * Math.cos(lat2)
            * Math.pow(Math.sin(dlon / 2),2);

        let c = 2 * Math.asin(Math.sqrt(a));

        // Radius of earth in kilometers. Use 3956
        // for miles
        let r = 3956;

        // calculate the result
        return(c * r);
    }

    function cachePostIds(postsObj) {
        Object.entries(postsObj).forEach((entry) => {
            if (!localStorage.getItem(entry[0])) {
                localStorage.setItem(entry[0], 'true')
            }
        });
    }
    // function postPostIds(postsObj) {
    //     let pkg = {"tag": "posts", "package": {}};
    //     Object.entries(postsObj).forEach((entry) => {
    //         pkg.package[entry[0]] = 'true';
    //     });
    //     navigator.serviceWorker.controller.postMessage(pkg);
    // }


    onMount(() => {
        Notification.requestPermission((result) => {
            if (result === 'granted') {
                console.log(result)
            }
        });
    })

    function uiInitAnim(elem) {
        elem.classList.remove('scale-0')
        elem.classList.add('transition')
        elem.classList.add('duration-1000')
        elem.classList.add('scale-100')
    }

    function uiShrink(elem) {
        elem.classList.remove('transition')
        elem.classList.remove('duration-1000')
        elem.classList.remove('scale-100')
        elem.classList.add('scale-0')
    }

    function uiHide(elem) {
        elem.classList.add('hidden')
    }

    function uiShow(elem) {
        elem.classList.remove('hidden')
    }

</script>
<div class="w-full max-w-3xl m-auto">

    <div class="w-full max-w-3xl h-screen fixed flex flex-col bg-white overflow-x-hidden">

        <!--Logo-->
        <div id="logo" class="w-12 h-12 flex justify-center items-center bg-gray-50 absolute z-10 rounded-br-full rounded-bl-full rounded-tr-full">
            <img src="logo.svg" alt="Logo">
        </div>

        <!--CenterOnSelf-->
        <div id="cos" class="cursor-pointer w-12 h-12 flex justify-center items-center bg-blue-500 absolute top-0 right-0 z-10 rounded-br-full rounded-bl-full rounded-tl-full" on:click={() => cos.set('center')}>
            <img src="locate.svg" alt="Center on Self">
        </div>

        <!--Menu-->
        <div id="menu" class="cursor-not-allowed w-28 h-28 flex justify-center items-center bg-gray-300 absolute bottom-0 right-0 z-10 rounded-tr-full rounded-bl-full rounded-tl-full scale-0 origin-bottom-right ease-springy">
            <img src="menu.svg" alt="Menu">
            <img src="disabled.svg" alt="Disabled" class="absolute">
        </div>

        <!--Pin-->
        <div id="pin" class="cursor-pointer w-28 h-28 flex justify-center items-center bg-yellow-300 absolute bottom-0 left-0 z-10 rounded-tr-full rounded-br-full rounded-tl-full scale-0 origin-bottom-left ease-springy" on:click={enterPin}>
            <img src="pin.svg" alt="Pin">
        </div>

        <!--Post-->
        <div id="post" class="w-full max-w-3xl h-screen pt-7 px-3 fixed flex flex-col z-20 bg-gray-50 hidden">

            <!--Poster-->
            <div class="w-fit h-fit flex flex-col px-6 gap-2">
                <img src="yo.png" alt="Yo" class="w-16 h-16 rounded-full">
                {#if $posts[currentPostId]}
                    <h2 class="text-lg leading-7 font-bold text-gray-700">{$posts[currentPostId].user}'s note:</h2>
                {/if}
            </div>

            <!--postContent-->
            <div class="w-full h-4/6 py-3 px-6">
                {#if $posts[currentPostId]}
                    <p class="text-lg-leading-7 font-medium text-gray-700">{$posts[currentPostId].content}</p>
                    <p class="text-lg-leading-7 font-medium text-gray-700">lat: {$posts[currentPostId].lat}</p>
                    <p class="text-lg-leading-7 font-medium text-gray-700">lng: {$posts[currentPostId].lng}</p>
                {/if}
            </div>

        </div>

        <!--postClose-->
        <div id="postClose" class="cursor-pointer z-20 w-28 h-28 flex justify-center items-center bg-gray-300 absolute bottom-0 right-0 z-10 rounded-tr-full rounded-bl-full rounded-tl-full scale-0 origin-bottom-right ease-springy" on:click={closePost}>
            <img src="close.svg" alt="Menu">
        </div>

        <!--Comment-->
        <div id="comment" class="cursor-not-allowed w-28 h-28 flex justify-center items-center bg-yellow-300 absolute bottom-0 left-0 z-20 rounded-tr-full rounded-br-full rounded-tl-full scale-0 origin-bottom-left ease-springy">
            <img src="comment.svg" alt="Comment">
            <img src="disabled.svg" alt="Disabled" class="absolute">
        </div>

        <!--addPin-->
        <div id="addPin" class="w-full max-w-3xl h-screen fixed flex flex-col items-center z-20 bg-gray-50 hidden">
            <div class="w-full h-4/6 pt-7 px-3 gap-6 flex flex-col items-center">

                <!--addMedia-->
                <div class="flex flex-col items-center gap-2">
                    <div class="cursor-not-allowed w-16 h-16 rounded-full bg-gray-700 flex justify-center items-center">
                        <img src="addMedia.svg" alt="Add Media">
                        <img src="disabled.svg" alt="Disabled" class="absolute">
                    </div>
                    <p class="text-lg leading-7 font-medium test-gray-700">Add a Photo or Video</p>
                </div>

                <!--Contents-->
                <div class="w-full h-4/6 flex flex-col items-center px-3 gap-6">
                    <textarea id="contents" placeholder="Add Note" class="rounded-lg w-full h-full border-gray-300" style="resize: none;"></textarea>
                </div>

                <!--submitPin-->
                <div id="submitPin" class="cursor-pointer w-28 h-28 flex justify-center items-center bg-yellow-300 rounded-full" on:click={submitPost}>
                    <img src="pin.svg" alt="Pin">
                </div>

            </div>
        </div>

        <!--addPinClose-->
        <div id="addPinClose" class="cursor-pointer z-20 w-28 h-28 flex justify-center items-center bg-gray-300 absolute top-0 right-0 z-20 rounded-tl-full rounded-bl-full rounded-br-full scale-0 origin-top-right ease-springy" on:click={exitPin}>
            <img src="close.svg" alt="Close">
        </div>

        <!--Map-->
        <Map />

        {#if posting}
            <div class="absolute z-100 top-0 left-0 w-full h-full bg-slate-500/50 flex items-center justify-center">
                <p class="text-white">Posting...</p>
            </div>
        {/if}

    </div>

</div>