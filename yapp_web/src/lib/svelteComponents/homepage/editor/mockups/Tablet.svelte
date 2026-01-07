<!-- https://tailwindflex.com/@prajwal/tablet-device-mockup -->
<div class="relative flex justify-center w-full aspect-3/2 border-8 border-black rounded-2xl bg-gray-800">
    <!-- Front camera (centered at top) -->
    <span class="absolute top-2 left-1/2 -translate-x-1/2 border border-black bg-black w-3 h-3 rounded-full"></span>

    <!-- Right-side button -->
    <span class="absolute -right-3 top-24 border-4 border-black h-16 rounded-md"></span>

    <!-- Screen / Content Area -->
    <div class="absolute p-5 space-y-2 top-1 bottom-1 left-1 right-1 rounded-xl bg-white overflow-y-auto no-scrollbar">
        <slot />
    </div>


</div>


