<script lang="ts">
  import { createEventDispatcher } from "svelte";

    export let length: number = 6;
    export let value = ""
    export let disabled = false;

    const dispatch = createEventDispatcher()

    let digits: string[] = Array.from({ length }, () => "");
    let inputElements: HTMLInputElement[] = [];

    function focusAt(index: number) {
        if(disabled) return;

        if(index >= 0 && index < length) {
            inputElements[index]?.focus()
        }
    }


    function handleInput(event: Event, index: number) {
        if(disabled) return;
        
        const input = event.target as HTMLInputElement;
        digits[index] = input.value;

        // Move Focus to next/previous field
        if(input.value && index < length - 1) { // Move focus to next on input
            focusAt(index + 1);
        } else if(!input.value && index > 0) { // Move focus to previous on backspace
            focusAt(index - 1)
        }

        // Check if all digits are filled
        if (digits.every(digit => digit)) {
            dispatch("complete", { digits });
        }
    }

    function handlePaste(event: ClipboardEvent) {
        if(disabled) return;

        event.preventDefault();
        
        const pasteData = event.clipboardData?.getData("text/plain").trim();
        if(!pasteData || pasteData.length != length) return;

        // Update Digits and Focus
        for(let i = 0; i < length; i++) {
            digits[i] = pasteData[i] || "";
        }

        focusAt(length - 1);
    }
</script>


<div class="w-full min-w-fit flex items-center justify-center">
    <div on:paste={handlePaste} class="flex gap-2 items-center justify-center bg-white p-3 rounded-2xl">
        
        {#each Array.from({ length }) as _, index }
            <div class="relative">
                <input
                    type="text"
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    pattern="\\d*"
                    maxlength="1"
                    disabled={disabled}
                    bind:this={inputElements[index]}
                    value={digits[index]}

                    on:input={(element) => handleInput(element, index)}

                    aria-label={`Digit ${index + 1} of ${length}`}
                    class="aspect-square shadow hover:shadow-xl text-center rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500"
                />
            </div>
        {/each}
    </div>
</div>

<p>Digits: {digits}</p>