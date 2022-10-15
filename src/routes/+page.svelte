<script>

    import { onMount } from 'svelte';

    onMount(() => {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            deferredPrompt = e;
        });

        const installApp = document.getElementById('installApp');

        installApp.addEventListener('click', async () => {
            if (deferredPrompt !== null) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    deferredPrompt = null;
                }
            }
        });
    })

</script>

<div class="bg-slate-100 w-full h-screen fixed flex justify-center items-center">
    <div class="bg-slate-200 w-fit max-w-sm h-fit rounded-md p-6 flex flex-col gap-4">
        <h1 class="text-lg leading-7 font-extrabold">Hi! 👋</h1>
        <p class="">Welcome to GeoNote, also know as gNote! This app works best when installed, if you'd like to give it a whirl, tap below!</p>
        <div class="w-full flex justify-center">
            <div class="cursor-pointer w-fit h-fit px-8 py-2 bg-yellow-300 rounded-lg text-lg leading-7 font-extrabold" id="installApp">
                Install App
            </div>
        </div>
    </div>
</div>