<script>
    import {onMount} from "svelte";

    let currentRoute = {path: '', home: 'bg-slate-200', social: 'bg-slate-200', settings: 'bg-slate-200'};

    onMount(() => {
        currentRoute.path = window.location.pathname;
        console.log(currentRoute.path)
        if (currentRoute.path === '/home') {
            currentRoute.home = 'bg-slate-300';
        } else {
            currentRoute.home = 'bg-slate-200'
        }if (currentRoute.path === '/social') {
            currentRoute.social = 'bg-slate-300';
        } else {
            currentRoute.social = 'bg-slate-200'
        }if (currentRoute.path === '/settings') {
            currentRoute.settings = 'bg-slate-300';
        } else {
            currentRoute.settings = 'bg-slate-200'
        }
    });
</script>

<div class="fixed z-50 w-full max-w-3xl m-auto h-fit flex flex-row bottom-0">
    <a href="/home" class="w-1/3 py-2.5 flex items-center justify-center { currentRoute.home }">
        <img src="/home-1-fill.svg" alt="home">
    </a>
    <a href="/social" class="w-1/3 py-2.5 flex items-center justify-center { currentRoute.social }">
        <img src="/group-fill.svg" alt="social">
    </a>
    <a href="/settings" class="w-1/3 py-2.5 flex items-center justify-center { currentRoute.settings }">
        <img src="/settings-fill.svg" alt="settings">
    </a>
</div>