<script>
	import { LiquidBackground, GlassButton, FractalCard } from '$lib/components';
	import { Stack } from '$lib/state';

	const tasks = new Stack();

	const colors = $state(['#640d5f', '#b12c00', '#eb5b00', '#ffcc00', '#640d5f', '#eb5b00']);
	const named_colors = $derived({
		color1: colors[0] ?? '#000',
		color2: colors[1] ?? '#000',
		color3: colors[2] ?? '#000',
		color4: colors[3] ?? '#000',
		color5: colors[4] ?? '#000',
		color6: colors[5] ?? '#000'
	});

	/** @type {string} */
	let title = $state('');
</script>

<LiquidBackground {...named_colors}></LiquidBackground>

<main class="grid min-h-screen grid-cols-1 grid-rows-[1fr_2fr] gap-6 px-3 py-6 font-sans">
	<header>
		<h1 class="text-3xl font-medium tracking-tight text-white">Stacked</h1>
	</header>

	<div>
		<form
			class="mx-auto mb-6 flex w-full gap-3"
			onsubmit={(e) => {
				e.preventDefault();
				tasks.add({ title });
				title = '';
			}}
		>
			<input
				type="text"
				placeholder="Add a new task"
				bind:value={title}
				class="w-full rounded-lg border border-white/10 bg-white/10 p-3 text-lg text-white placeholder-white/70 backdrop-blur-lg focus:border-white focus:ring-0"
			/>
			<GlassButton
				type="submit"
				disabled={!title.trim()}
				aria-label="Add task"
				class="hover:border-white/70 disabled:text-white/70"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-9 w-auto fill-current"
					viewBox="0 0 256 256"
					><path
						d="M231.87,114l-168-95.89A16,16,0,0,0,40.92,37.34L71.55,128,40.92,218.67A16,16,0,0,0,56,240a16.15,16.15,0,0,0,7.93-2.1l167.92-96.05a16,16,0,0,0,.05-27.89ZM56,224a.56.56,0,0,0,0-.12L85.74,136H144a8,8,0,0,0,0-16H85.74L56.06,32.16A.46.46,0,0,0,56,32l168,95.83Z"
					></path></svg
				>
			</GlassButton>
			<!-- </button> -->
		</form>

		{#if tasks.top}
			<FractalCard gradientColors={colors}>
				{tasks.top.title}
			</FractalCard>

			<div class="mt-9 flex w-full justify-center gap-32">
				<GlassButton
					onclick={() => tasks.remove()}
					aria-label="Delete task"
					class="hover:border-red-400/80 hover:bg-red-400/10 hover:text-red-400/80"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-9 w-auto fill-current"
						viewBox="0 0 256 256"
						><path
							d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
						></path></svg
					>
				</GlassButton>
				<GlassButton
					onclick={() => tasks.remove()}
					aria-label="Mark task as complete"
					class="hover:border-green-400/80 hover:bg-green-400/10 hover:text-green-400/80"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-9 w-auto fill-current"
						viewBox="0 0 256 256"
						><path
							d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"
						></path></svg
					>
				</GlassButton>
			</div>
		{/if}
	</div>
</main>
