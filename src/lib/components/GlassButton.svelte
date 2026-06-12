<script>
	import { fade } from 'svelte/transition';
	let { children, ...rest } = $props();
</script>

<button
	in:fade={{ duration: 150 }}
	out:fade={{ duration: 150 }}
	{...rest}
	class={[
		'glass cursor-pointer rounded-full p-3 text-white transition-colors duration-75 ease-in-out',
		rest.class
	]}
>
	{@render children?.()}
</button>
