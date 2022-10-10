<script>
    import {onMount} from 'svelte';

    function setActiveTab(tab) {
        currentRoute.active = tab;
        currentRoute = currentRoute;
        if (currentRoute.active === 'home') {
            currentRoute.home = 'bg-slate-300';
        } else {
            currentRoute.home = 'bg-slate-200'
        }
        if (currentRoute.active === 'social') {
            currentRoute.social = 'bg-slate-300';
        } else {
            currentRoute.social = 'bg-slate-200'
        }
        if (currentRoute.active === 'settings') {
            currentRoute.settings = 'bg-slate-300';
        } else {
            currentRoute.settings = 'bg-slate-200'
        }
    }

    let currentRoute = {active: '', home: 'bg-slate-200', social: 'bg-slate-200', settings: 'bg-slate-200'};

    onMount(() => {
        setActiveTab('home')
    })


</script>

<div class="fixed z-50 w-full max-w-3xl m-auto h-fit flex flex-row bottom-0">
    <div on:click={() => setActiveTab('settings')} class="w-1/3 py-2.5 flex items-center justify-center { currentRoute.settings }">
        <img src="/settings-fill.svg" alt="settings">
    </div>
    <div on:click={() => setActiveTab('home')} class="w-1/3 py-2.5 flex items-center justify-center { currentRoute.home }">
        <img src="/home-1-fill.svg" alt="home">
    </div>
    <div on:click={() => setActiveTab('social')} class="w-1/3 py-2.5 flex items-center justify-center { currentRoute.social }">
        <img src="/group-fill.svg" alt="social">
    </div>
</div>