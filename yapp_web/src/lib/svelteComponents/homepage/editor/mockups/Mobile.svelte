<!-- https://tailwindflex.com/@prajwal/mobile-device-mockup-2 -->
<div  class="relative flex justify-center h-150 aspect-9/19 border-4 border-black rounded-2xl bg-gray-800">
    <!-- Content -->
    <div class="absolute p-5 aspect-9/19 top-1 bottom-2 left-1 right-1 rounded-xl bg-white overflow-y-auto no-scrollbar">
        <slot />
    </div>

    <!-- Punch hole camera -->
    <span class="absolute top-2 border border-black bg-black w-3 h-3 rounded-full"></span>

    <!-- Right buttons -->
    <span class="absolute -right-2 top-20 border-4 border-black h-10 rounded-md"></span>
    <span class="absolute -right-2 top-44 border-4 border-black h-24 rounded-md"></span>
</div>

<style>
    /* Hide scrollbar for Chrome, Safari, and Edge */
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }

  /* Hide scrollbar for Firefox */
    .no-scrollbar {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
    }

    /* Enable smooth touch scrolling (optional for mobile) */
    .no-scrollbar {
        -webkit-overflow-scrolling: touch;
    }
</style>
