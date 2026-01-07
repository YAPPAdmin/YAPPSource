
<!-- https://tailwindflex.com/@leon-bachmann/safari-browser-mockup-dark -->
<div class="w-full mx-auto border-4 border-black rounded-lg bg-gray-800">
    <!-- Top window bar -->
    <div class="w-full h-11 rounded-t-lg bg-gray-900 flex justify-start items-center space-x-1.5 px-3">
        <span class="w-3 h-3 rounded-full bg-red-400"></span>
        <span class="w-3 h-3 rounded-full bg-yellow-400"></span>
        <span class="w-3 h-3 rounded-full bg-green-400"></span>
    </div>

    <!-- Scrollable screen area -->
    <div class="bg-white p-5 aspect-video border-t-0 w-full overflow-y-auto no-scrollbar rounded-b-lg">
        <slot />
    </div>
</div>

