<script lang="ts">
  import { fade } from 'svelte/transition';

  export let src: string;
  export let alt: string = "";

  let isLoading = true;
</script>

<div class="relative inline-block">
  {#if isLoading}
    <div class="flex animate-pulse">
      <span class="block bg-gray-200 rounded-xl w-full h-full"></span>
    </div>
  {/if}

  {#if !isLoading}
    <img
      src={src}
      alt={alt}
      transition:fade={{ duration: 250 }}
      on:load={() => (isLoading = false)}
      {...$$restProps}
    />
  {/if}
</div>
