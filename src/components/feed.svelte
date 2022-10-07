<script>
    let feedExpandedState = {state: false, class:"h-1/2", width:"w-40"};
    function toggleExpandedState() {
        if (!feedExpandedState.state) {
            feedExpandedState.class = "h-full";
            feedExpandedState.state = true;
            feedExpandedState.width = "w-10";
        } else if (feedExpandedState.state) {
            feedExpandedState.class = "h-1/2";
            feedExpandedState.state = false;
            feedExpandedState.width = "w-40";
        }
    }
</script>

<div class="relative bottom-0 w-full max-w-3xl {feedExpandedState.class} flex flex-col bg-slate-100 transition-height duration-500 ease-in-out overflow-x-hidden">
   <div class="w-full flex items-center justify-between bg-slate-200">
       <div class="flex items-center gap-x-3 p-3">
           <img src="../../static/logo.svg" alt="logo">
           <p class="text-lg leading-7 font-extrabold">:GeoNote</p>
       </div>
       <div class="h-full {feedExpandedState.width} items-center p-2.5 gap-x-2.5 flex bg-yellow-300 cursor-pointer transition-all duration-200" on:click={toggleExpandedState}>
           {#if !feedExpandedState.state}
               <img class="h-2/3" src="../../static/add-line.svg" alt="add">
           {/if}
           {#if feedExpandedState.state}
               <img class="h-2/3" src="../../static/close-circle-fill.svg" alt="close">
           {/if}
           {#if !feedExpandedState.state}
                <p class="text-lg leading-7 font-extrabold min-w-max">Add a Note</p>
           {/if}
       </div>
   </div>
</div>