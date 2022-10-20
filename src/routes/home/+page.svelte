<script>
    import Cookies from 'js-cookie'
    import Map from "../../components/map.svelte"
    import { initializeApp } from "firebase/app";
    import {getDatabase, ref as fireRef, set, push, onValue, get, ref} from "firebase/database";
    import { getStorage, ref as storeRef, uploadBytes, getDownloadURL } from "firebase/storage";
    import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation'
    import { posts, feedState, cos } from "../../stores.js"

    let uid;
    // export function load() {
    //     console.log('run client')
    //     let cookie = Cookies.get('authcookie')
    //     if(cookie === 'false') {
    //         goto('/')
    //     }
    // }

    let loc
    let lat = '0'
    let lng = '0'
    let currentPostId;
    // let localPosts = {};
    posts.set({id: {loading: true}})

    let currentRecording = null;
    let camera;
    let cameraMode = 'back';
    let canvas;
    let ctx;
    let canvasStart = false;
    let currentStream
    let captureStream;
    let mediaStream;
    let recorder;
    let recording = false;
    let recordingTimeMS = 5000;

    let pinUser = 'Blank';

    let uiLogo;
    let uiCoS;
    let uiMenu;
    let uiPin;
    let uiPinVideo;
    let uiPost;
    let uiPostClose;
    let uiComment;
    let uiAddPin;
    let uiSubmitPin;
    let uiAddPinClose;
    let uiAddMedia;
    let uiRecordMedia;
    let uiPreview;
    let uiRecording;
    let uiFinalPreview;
    let uiVideo;
    let uiPicture;
    let uiApproveMedia;
    let uiAcceptMedia;
    let uiRejectMedia;

    onMount(() => {

        document.getElementById('loadingSplash').classList.add('hidden');
        uid = Cookies.get('authcookie');

        console.log('canvas start')
        let request;
        let video = document.getElementById('preview')
        const renderVideo = () => {
            request = requestAnimationFrame(renderVideo)
            console.log('drawing')
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        video.addEventListener('play', () => {
            renderVideo();
        })

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
        uiAddMedia = document.getElementById('addMedia');
        uiRecordMedia = document.getElementById('recordMedia');
        uiPreview = document.getElementById('preview');
        uiRecording = document.getElementById('recording');
        uiFinalPreview = document.getElementById('finalPreview');
        uiVideo = document.getElementById('takeVideo');
        uiPicture = document.getElementById('takePicture');
        uiApproveMedia = document.getElementById('approveMedia');
        uiAcceptMedia = document.getElementById('acceptMedia');
        uiRejectMedia = document.getElementById('rejectMedia');
        uiInitAnim(uiMenu);
        uiInitAnim(uiPin);

        uiLogo.addEventListener("click", () => {
            location.reload();
            return false;
        })

        const takeVideo = document.getElementById('takeVideo');
        takeVideo.addEventListener('click', () => {
            record();
        })
        const stopVideo = document.getElementById('stopVideo');
        stopVideo.addEventListener('click', () => {
            stopRecording(captureStream);
        })

        document.getElementById('previewCanvas').addEventListener("click", (event) => {
            event.stopPropagation()
            if (cameraMode === 'front' && !recording) {
                cameraMode = 'back';
                camera = navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment'
                    },
                    audio: true
                }).then((stream) => {
                    currentStream = stream;
                    // if(recorder && recorder.state === 'recording') {
                    //     recorder.stop()
                    // }
                    // // recorder = new MediaRecorder(captureStream);
                    uiPreview.srcObject = currentStream;
                })
            } else if(cameraMode === 'back' && !recording) {
                cameraMode = 'front'
                camera = navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user'
                    },
                    audio: true
                }).then((stream) => {
                    currentStream = stream;
                    // if(recorder && recorder.state === 'recording') {
                    //     recorder.stop()
                    // }
                    // recorder = new MediaRecorder(captureStream);
                    uiPreview.srcObject = currentStream;
                })
            }
        })

        uiAcceptMedia.addEventListener("click", (event) => {
            event.stopPropagation()
            uiRecording.src = "";
            uiHide(uiApproveMedia);
            uiHide(uiRecordMedia);
            document.getElementById('finalPreview').src = URL.createObjectURL(currentRecording);
            uiHide(uiAddMedia);
            uiShow(document.getElementById('finalPreview'));
            console.log(currentRecording)
        })

        uiRejectMedia.addEventListener("click", (event) => {
            event.stopPropagation()
            camera = navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment'
                },
                audio: true
            }).then((stream) => {
                currentStream = stream
                // if(recorder && recorder.state === 'recording') {
                //     recorder.stop()
                // }
                // recorder = new MediaRecorder(captureStream);
                uiPreview.srcObject = currentStream;
                mediaStream = new Promise((resolve) => uiPreview.onplaying = resolve);
            })
            uiRecording.src = "";
            uiHide(uiApproveMedia);
        })


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
            // refreshFeed();
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
    const auth = getAuth();
    const postListRef = fireRef(db, '/posts');
    // Get a reference to the storage service, which is used to create references in your storage bucket
    const storage = getStorage();


    // let feedExpandedState = {state: 'feed', class:"h-1/2", width:"w-40"};
    // function togglePostState(state) {
    //     if (feedExpandedState.state === 'feed' && state !== 'post') {
    //         feedExpandedState.class = "h-3/5";
    //         feedExpandedState.state = 'add';
    //         feedExpandedState.width = "w-10";
    //     } else if (feedExpandedState.state === 'add' || feedExpandedState.state === 'post' && state !== 'post') {
    //         feedExpandedState.class = "h-1/2";
    //         feedExpandedState.state = 'feed';
    //         feedExpandedState.width = "w-40";
    //     } else if (state === 'post') {
    //         feedExpandedState.class = "h-3/5";
    //         feedExpandedState.state = 'post';
    //         feedExpandedState.width = "w-10";
    //     }
    // }

    function signOutUser() {
        signOut(auth).then(() => {
            // Sign-out successful.
            Cookies.set('authcookie', 'false')
            goto('/')
        }).catch((error) => {
            // An error happened.
            console.log(error);
        });
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
                const {coords} = res;
                lat = coords.latitude;
                lng = coords.longitude;
                let post = document.getElementById('contents');
                const postContents = post.value;
                post.value = "";
                const newPostRef = push(postListRef);
                console.log(newPostRef);
                let username;
                get(ref(db, 'users/' + uid)).then((snapshot) => {
                    let usr = snapshot.val();
                    username = usr.username
                    // console.log(username)
                }).then(() => {
                    if (currentRecording === null) {
                        set(newPostRef, {
                            user: username,
                            lat: lat,
                            lng: lng,
                            content: postContents
                        });
                    } else if (currentRecording !== null) {
                        console.log(newPostRef._path.pieces_[1]);
                        let storageId = storeRef(storage, "/videos/" + newPostRef._path.pieces_[1])
                        uploadBytes(storageId, currentRecording).then((snapshot) => {
                            console.log('Uploaded a blob or file!');
                        }).then(() => {
                            getDownloadURL(storageId)
                                .then((url => {
                                    get(ref(db, 'users/' + uid)).then((snapshot) => {
                                        let usr = snapshot.val();
                                        username = usr.username
                                    })
                                    set(newPostRef, {
                                        user: username,
                                        lat: lat,
                                        lng: lng,
                                        content: postContents,
                                        videoPath: url
                                    });
                                }))
                        })
                    }
                })
                if(document.getElementById('pinVideo')) {
                    document.getElementById('pinVideo').src = "";
                }
                uiHide(uiAddPin)
                uiHide(uiPost)
                uiShrink(uiAddPinClose);
                uiInitAnim(uiMenu);
                uiInitAnim(uiPin);
                posting = false;
            })
    }

    async function openPost(id) {
        currentPostId = id;
        pinUser = $posts[currentPostId].user
        uiShrink(uiMenu);
        uiShrink(uiPin);
        await uiShow(uiPost);
        document.getElementById('pinVideo').src = $posts[currentPostId].videoPath;
        // togglePostState('post')
        if ($feedState !== 'unset') {
            feedState.set('unset');
        }
        uiInitAnim(uiPostClose);
        uiInitAnim(uiComment);
    }

    function closePost() {
        if (document.getElementById('pinVideo')) {
            document.getElementById('pinVideo').src = "";
        }
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
        uiShow(uiAddMedia)
    }

    function record() {
        mediaStream.then(() => {
            uiHide(uiAddPinClose);
            uiHide(document.getElementById('takeVideo'))
            uiShow(document.getElementById('stopVideo'))
            startRecording(recordingTimeMS)
                .then((recordedChunks) => {
                    let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
                    currentRecording = recordedBlob;
                    uiRecording.src = URL.createObjectURL(recordedBlob);
                    uiShow(uiApproveMedia);
                    console.log(recordedBlob.size);
                    uiShow(uiAddPinClose)
                    uiHide(document.getElementById('stopVideo'))
                    uiShow(document.getElementById('takeVideo'))
                }).catch((error) => {
                if (error.name === "NotFoundError") {
                    console.log("Camera or microphone not found. Can't record.");
                } else {
                    console.log(error);
                }
            });
        })
    }

    function addMedia() {
        console.log('click')
        uiShow(uiRecordMedia);
        camera = navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment'
            },
            audio: true
        }).then((stream) => {
            currentStream = stream
            uiPreview.srcObject = currentStream;
            // if(recorder && recorder.state === 'recording') {
            //     recorder.stop()
            // }
            mediaStream = new Promise((resolve) => uiPreview.onplaying = resolve);
            canvas = document.getElementById('previewCanvas');
            ctx = canvas.getContext('2d');
            captureStream = canvas.captureStream()
            canvasStart = true;
            console.log(canvasStart)
        })
    }

    function exitPin() {
        currentRecording = null
        if (document.getElementById('recording')) {
            document.getElementById('recording').src = "";
        }
        if (document.getElementById('preview')) {
            document.getElementById('preview').src = "";
        }
        if (document.getElementById('finalPreview')) {
            document.getElementById('finalPreview').src = "";
        }
        uiHide(uiApproveMedia)
        uiHide(uiRecordMedia)
        uiHide(uiAddPin)
        uiHide(uiPost)
        uiShrink(uiAddPinClose);
        uiInitAnim(uiMenu);
        uiInitAnim(uiPin);
    }

    // function refreshFeed() {
    //     // console.log(localPosts);
    //     // let listObj = {};
    //     // console.log(Object.entries($posts))
    //     Object.entries($posts).forEach((entry) => {
    //         // console.log(entry);
    //         // console.log(userLoc);
    //         const distance = findPinDistance($userLoc.coords.latitude, entry[1].lat, $userLoc.coords.longitude, entry[1].lng);
    //         if (distance < 1 && localPosts[entry[0]] === undefined) {
    //             localPosts[entry[0]] = entry[1]
    //             // console.log(listObj)
    //             // console.log(Object.entries($localPosts)[entry[0]])
    //         }
    //         // localPosts.set(listObj);
    //         // console.log($localPosts)
    //         // console.log(Object.entries($localPosts)[entry[0]])
    //         // postPostIds(localPosts);
    //         cachePostIds(localPosts);
    //     });
    // }

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

    function wait(delay) {
        return new Promise((resolve) => setTimeout(resolve, delay));
    }

    function startRecording(length) {
        let data = [];
        if (!recorder) {
            recorder = new MediaRecorder(captureStream);
            recorder.start();
        }else if (recorder.state === 'paused') {
            recorder.resume();
        }recorder
        recorder.ondataavailable = (event) => data.push(event.data);


        let stopped = new Promise((resolve, reject) => {
            recorder.onstop = resolve;
            recorder.onerror = (event) => reject(event.name);
        });

        let recorded = wait(length).then(() => {
                if (recorder.state === "recording") {
                    recorder.stop();
                    stopped.resolve();
                }
            },
        );

        return Promise.any([stopped]).then(() => data);
    }

    function stopRecording(stream) {
        // recorder.stop();
        uiHide(document.getElementById('stopVideo'))
        uiShow(document.getElementById('takeVideo'))
        recorder.stop()
        recorder = null;
        // stream.getTracks().forEach((track) => track.stop());
    }

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
    <div id="loadingSplash" class="absolute bg-gray-50 w-full h-full z-50 max-w-3xl flex justify-center items-center">
        <p class="text-lg leading-7 font-extrabold text-blue-500">Loading...</p>
    </div>

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
        <div id="menu" class="cursor-not-allowed w-28 h-28 flex justify-center items-center bg-gray-300 absolute bottom-0 right-0 z-10 rounded-tr-full rounded-bl-full rounded-tl-full scale-0 origin-bottom-right ease-springy" on:click={signOutUser}>
            <img src="menu.svg" alt="Menu">
            <img src="disabled.svg" alt="Disabled" class="absolute">
        </div>

        <!--Pin-->
        <div id="pin" class="cursor-pointer w-28 h-28 flex justify-center items-center bg-yellow-300 absolute bottom-0 left-0 z-10 rounded-tr-full rounded-br-full rounded-tl-full scale-0 origin-bottom-left ease-springy" on:click={enterPin}>
            <img src="pin.svg" alt="Pin">
        </div>

        <!--Post-->
        <div id="post" class="w-full max-w-3xl h-screen px-3 fixed flex flex-col z-20 bg-gray-50 hidden">

            <!--Media-->

            {#if $posts && $posts[currentPostId] !== undefined}
                {#if $posts[currentPostId].videoPath}
                    <div class="w-full h-min flex pt-4 justify-center mb-4">
<!--                        <div class="w-full h-min flex absolute">-->
<!--                            <p class="text-gray-100">Loading...</p>-->
<!--                        </div>-->
                        <div class="w-48 h-48 max-w-xs max-h-80 rounded-lg overflow-hidden relative">
                            <video id="pinVideo" class="w-full h-full object-cover" src="" autoplay loop playsinline></video>
                        </div>
                    </div>
                {/if}
            {/if}


            <div class="w-full max-w-xs justify-center h-fit flex flex-col mx-auto {$posts && $posts[currentPostId] && $posts[currentPostId].videoPath ? 'mt-2': 'mt-6'} py-6 px-2 bg-yellow-50 rounded-lg">

                <!--Poster-->
                <div class="w-fit h-fit flex flex-row px-6 items-center gap-2">
                    {#if $posts && $posts[currentPostId]}
                        <div class="">
                            <img src="yo.png" alt="Yo" class="w-16 h-16 rounded-full">
                            <h2 id="pinUser" class="text-lg leading-7 font-bold text-gray-700">{pinUser}:</h2>
                        </div>
                        <div class="">
                            <p class="text-xs text-gray-700">lat: {$posts[currentPostId].lat}</p>
                            <p class="text-xs text-gray-700">lng: {$posts[currentPostId].lng}</p>
                        </div>
                    {/if}
                </div>

                <!--postContent-->
                <div class="w-full h-4/6 py-3 px-6">
                    {#if $posts && $posts[currentPostId]}
                        <div class="w-full h-24 overflow-y-scroll">
                            <p class="text-lg-leading-7 font-medium text-gray-700 mb-2">{$posts[currentPostId].content}</p>
                        </div>
                    {/if}
                </div>

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
            <div class="w-full h-2/4 pt-7 px-3 gap-6 flex flex-col items-center">

                <!--Media-->

                <!--addMedia-->
                <div class="flex flex-col items-center gap-2">
                    <div id="addMedia" class="cursor-pointer w-16 h-16 rounded-full bg-gray-700 flex justify-center items-center" on:click={addMedia}>
                        <img src="addMedia.svg" alt="Add Media">
                    </div>
                    <p class="text-lg leading-7 font-medium test-gray-700">Add a Photo or Video</p>
                </div>

                <!--finalPreview-->
                <div class="w-48 h-48 rounded-lg overflow-hidden relative">
                    <video id="finalPreview" class="w-full h-full object-cover" src="" autoplay loop muted playsinline></video>
                </div>

                <!--Contents-->
                <div class="w-full h-fit flex flex-col items-center px-3 gap-6">
                    <textarea id="contents" placeholder="Add Note" class="rounded-lg w-full h-full border-gray-300" style="resize: none;"></textarea>
                </div>

                <!--submitPin-->
                <div id="submitPin" class="cursor-pointer w-28 h-28 flex justify-center items-center bg-yellow-300 rounded-full" on:click={submitPost}>
                    <img src="pin.svg" alt="Pin">
                </div>



            </div>
        </div>

        <!--addPinClose-->
        {#if !posting}
            <div id="addPinClose" class="cursor-pointer z-50 w-28 h-28 flex justify-center items-center bg-gray-300 absolute top-0 right-0 rounded-tl-full rounded-bl-full rounded-br-full scale-0 origin-top-right ease-springy" on:click={exitPin}>
                <img src="close.svg" alt="Close">
            </div>
        {/if}

        <!--recordMedia-->
        <div id="recordMedia" class="w-full max-w-3xl h-screen fixed flex flex-col justify-center items-center gap-y-6 z-30 bg-gray-50 hidden">
            <h2 class="text-lg leading-7 font-bold">Tap video to switch cameras</h2>
            <div id="videoFrame" class="w-48 h-48 rounded-lg overflow-hidden relative">
                <video id="preview" class="w-full h-full object-cover relative z-0" autoplay muted playsinline></video>
                <canvas id="previewCanvas" class="w-full h-full object-cover absolute top-0 z-30"></canvas>
            </div>
            <div class="w-fit h-fit flex gap-x-6">
                <div id="takePicture" class="cursor-pointer w-28 h-28 flex justify-center items-center bg-yellow-300 rounded-full">
                    <img src="camera.svg" alt="Take Picture">
                    <img src="disabled.svg" alt="Disabled" class="absolute">
                </div>
                <div id="takeVideo" class="cursor-pointer w-28 h-28 flex justify-center items-center bg-gray-700 rounded-full">
                    <img src="video.svg" alt="Take Video">
                </div>
                <div id="stopVideo" class="cursor-pointer w-28 h-28 flex justify-center items-center bg-red-500 rounded-full hidden">
                    <img src="video.svg" alt="Take Video">
                </div>
            </div>
        </div>

        <!--approveMedia-->
        <div id="approveMedia" class="w-full max-w-3xl h-screen fixed flex flex-col justify-center items-center gap-y-6 z-40 bg-gray-50 hidden">
            <div class="w-48 h-48 rounded-lg overflow-hidden relative">
                <video id="recording" class="w-full h-full object-cover" autoplay loop playsinline></video>
            </div>
            <div class="w-fit h-fit flex gap-x-6">
                <div id="rejectMedia" class="cursor-pointer w-28 h-28 flex justify-center items-center bg-yellow-300 rounded-full">
                    <img src="back.svg" alt="Back">
                </div>
                <div id="acceptMedia" class="cursor-pointer w-28 h-28 flex justify-center items-center bg-blue-500 rounded-full">
                    <img src="checkbox-fill.svg" alt="Accept">
                </div>
            </div>
        </div>

        <!--Map-->
        <Map />

        {#if posting}
            <div class="absolute z-50 top-0 left-0 w-full h-full bg-slate-500/50 flex items-center justify-center">
                <p class="text-white">Posting...</p>
            </div>
        {/if}

    </div>

</div>