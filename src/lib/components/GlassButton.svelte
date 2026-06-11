<script>
	let { classes = '', children, ...rest } = $props();
</script>

<button
	{...rest}
	class={[
		'cursor-pointer rounded-full border border-white/10 bg-white/10 p-3 text-white backdrop-blur-lg transition-colors duration-75 ease-in-out',
		rest.class
	]}
>
	{@render children?.()}
</button>
