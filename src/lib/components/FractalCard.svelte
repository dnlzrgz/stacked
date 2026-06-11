<script>
	let {
		steps = 16,
		flip = false,
		numOctaves = 16,
		hue = 0,
		saturation = 0,
		brightness = 0,
		scale = 10,
		gradientColors = ['#ffba49', '#20a39e', '#e07be0', '#ff674d', '#272932', '#ed6a5e'],
		children
	} = $props();

	const filterId = 'displacementFilter';

	const gradientStyle = $derived(
		`linear-gradient(${Math.floor(Math.random() * 360)}deg, ${gradientColors.join(', ')})`
	);

	const colorFilter = $derived(
		`hue-rotate(${hue}deg) saturate(${100 + +saturation}%) brightness(${100 + +brightness}%)`
	);

	const slices = $derived(
		Array.from({ length: steps }, (_, i) => ({
			i,
			flipX: flip && i % 2 === 0 ? 'scaleX(1)' : 'scaleX(-1)',
			cellWidth: (100 / steps) * (1 - (Math.abs(i - steps / 2) / (steps / 2)) * 0.2),
			bgPos: `${(i / steps) * 100}% 50%`
		}))
	);
</script>

<div class="relative mx-auto h-80 w-full overflow-hidden rounded-lg border border-white/10">
	<div
		class="absolute inset-0"
		style="background: {gradientStyle}; filter: url(#{filterId});"
	></div>

	<div class="pointer-events-none absolute inset-0 flex">
		{#each slices as s (s.i)}
			<div
				class="h-full"
				style="
					width: {s.cellWidth}%;
					transform: {s.flipX};
					background: {gradientStyle};
					background-size: {steps * 100}% 100%;
					background-position: {s.bgPos};
					filter: {colorFilter};
				"
			></div>
		{/each}
	</div>

	{#if children}
		<div
			class="font-xl relative z-10 flex h-full w-full items-center justify-center border border-white/10 bg-white/10 text-center font-sans text-2xl font-medium text-white"
		>
			{@render children()}
		</div>
	{/if}
</div>

<svg class="hidden" aria-hidden="true" focusable="false">
	<filter id={filterId} filterUnits="userSpaceOnUse">
		<feTurbulence type="fractalNoise" {numOctaves} stitchTiles="stitch" result="turbulence" />
		<feDisplacementMap
			in="SourceGraphic"
			in2="turbulence"
			{scale}
			xChannelSelector="R"
			yChannelSelector="G"
		/>
	</filter>
</svg>
