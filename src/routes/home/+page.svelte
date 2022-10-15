<script>
    import Feed from "../../components/feed.svelte"
    import Map from "../../components/map.svelte"
    import Navbar from '../../components/navbar.svelte'
    import {onMount} from "svelte"

    onMount(() => {
        Notification.requestPermission((result) => {
            if (result === 'granted') {
                console.log(result)
            }
        });
    })

</script>

<div class="w-full max-w-3xl h-screen flex flex-col m-auto items-center bg-white overflow-x-hidden">
    <Map />
    <Feed />
    <Navbar />
</div>