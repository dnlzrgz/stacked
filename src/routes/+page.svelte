<script>
	import { LiquidBackground, GlassButton } from '$lib/components';
	import { Stack } from '$lib/state';
	import { fade, fly } from 'svelte/transition';
	import { m } from '$lib/paraglide/messages';

	const tasks = $state(new Stack());

	/** @type {object} */
	const colors = {
		color1: '#f15a22',
		color2: '#f15a22',
		color3: '#40e0d0',
		color4: '#f15a22',
		color5: '#0a0e27',
		color6: '#40e0d0'
	};

	/** @type {string} */
	let title = $state('');
</script>

<LiquidBackground {...colors}></LiquidBackground>

<main class="grid h-full max-h-dvh grid-cols-1 grid-rows-[1fr_3fr] gap-6 px-3 py-6 font-sans">
	<header>
		<h1 class="text-3xl font-medium tracking-tight text-white">Stacked</h1>
	</header>

	<div>
		<form
			class="mx-auto mb-6 flex w-full gap-6 lg:max-w-1/2"
			onsubmit={(e) => {
				e.preventDefault();
				tasks.add({ title });
				title = '';
			}}
		>
			<input
				type="text"
				placeholder={m.task_input_placeholder()}
				bind:value={title}
				class="glass w-full rounded-lg p-3 text-lg text-white placeholder-white/70 focus:border-white focus:ring-0"
			/>
			<GlassButton
				type="submit"
				disabled={!title.trim()}
				aria-label={m.add_task_aria()}
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
		</form>

		{#if tasks.top}
			<ul
				in:fade={{ duration: 150 }}
				out:fade={{ duration: 150 }}
				class="relative h-96 overflow-hidden"
			>
				{#each tasks.stack as task, i (task.id)}
					{@const j = tasks.stack.length - 1 - i}
					<div
						class="absolute inset-0 mx-auto h-full max-h-80 transition-all duration-150 ease-in-out lg:max-w-1/2"
						style="
			        z-index: {999 - j};
			        transform:
				        translateY({j * 24}px)
				        scale({1 - j * 0.09});
		          "
					>
						<li
							class="glass flex h-full w-full items-center justify-center rounded-lg p-6 text-center font-sans text-2xl text-white"
							in:fly={{ y: -60, duration: 150 }}
							out:fly={{ y: -60, duration: 150 }}
						>
							{#if j == 0}
								{tasks.top.title}
							{/if}
						</li>
					</div>
				{/each}
			</ul>

			<div class="mt-9 flex w-full justify-center gap-24 lg:gap-12">
				<GlassButton
					onclick={() => tasks.remove()}
					aria-label={m.delete_task_aria()}
					class="z-999 hover:border-red-400/80 hover:bg-red-400/10 hover:text-red-400/80"
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
					aria-label={m.complete_task_aria}
					class="z-999 hover:border-green-400/80 hover:bg-green-400/10 hover:text-green-400/80"
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
