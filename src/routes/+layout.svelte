<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import { m } from '$lib/paraglide/messages';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';

	let { children } = $props();
	const title = 'Stacked';
</script>

<svelte:head>
	<title>Stacked</title>
	<meta name="title" content={title} />
	<meta name="description" content={m.seo_description()} />

	<meta name="keywords" content={m.seo_keywords()} />

	{#each locales as locale}
		<link
			rel="alternate"
			hreflang={locale}
			href={resolve(localizeHref(page.url.pathname, { locale }))}
		/>
	{/each}

	<meta name="author" content="dnlzrgz" />
	<meta name="robots" content="index, follow" />
	<meta name="googlebot" content="index, follow" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={title} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={m.seo_description()} />
	<!-- <meta property="og:url" content="https://your-domain.com" /> -->
	<!-- <meta property="og:image" content="https://your-domain.com/og-image.png" /> -->
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<meta property="og:image:alt" content="{title} preview image" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={m.seo_description()} />
	<!-- <meta name="twitter:image" content="https://your-domain.com/og-image.png" /> -->

	<meta name="twitter:image:alt" content="{title} preview image" />

	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }))}>{locale}</a>
	{/each}
</div>
