<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import Heading from '$lib/components/primitives/Heading.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import Card from '$lib/components/primitives/Card.svelte';
	import { getT } from '$lib/i18n/runtime';

	const t = getT();

	const features = [
		{ title: 'Edge-first delivery', desc: 'Global CDN with sub-5ms cold starts for your public content.' },
		{ title: 'Streaming SSR', desc: 'Skeleton-first rendering that gets content in front of users faster.' },
		{ title: 'Zero-config i18n', desc: 'Multi-locale out of the box with URL-based routing and hreflang.' },
		{ title: 'Design tokens', desc: 'Semantic CSS variables that power light and dark mode with zero effort.' }
	];

	const pricing = [
		{ name: 'Starter', price: '$29', desc: 'For small teams getting started.', cta: 'Get started' },
		{ name: 'Pro', price: '$99', desc: 'For growing teams that need more.', cta: 'Get started', popular: true },
		{ name: 'Enterprise', price: 'Custom', desc: 'For organizations at scale.', cta: 'Contact us' }
	];
</script>

<Container size="lg" class="py-20">
	<div class="mx-auto max-w-3xl text-center">
		<Heading level={1} size="3xl">{t('home.hero.title')}</Heading>
		<p class="mt-4 text-lg text-fg-muted">{t('home.hero.subtitle')}</p>
		<div class="mt-8 flex items-center justify-center gap-4">
			<Button size="lg">{t('home.hero.cta')}</Button>
			<Button variant="secondary" size="lg">Learn more</Button>
		</div>
	</div>

	<div class="mt-24">
		<Heading level={2} size="2xl" class="mb-12 text-center">{t('home.features.title')}</Heading>
		<div class="grid gap-8 md:grid-cols-2">
			{#each features as f}
				<Card padding="lg" class="border-border hover:border-primary transition-colors">
					<h3 class="text-xl font-semibold text-fg">{f.title}</h3>
					<p class="mt-3 text-fg-muted">{f.desc}</p>
				</Card>
			{/each}
		</div>
	</div>

	<div class="mt-24">
		<Heading level={2} size="2xl" class="mb-12 text-center">Pricing</Heading>
		<div class="grid gap-8 md:grid-cols-3 items-stretch">
			{#each pricing as p}
				<Card padding="lg" shadow={true} class="flex flex-col border-border">
					<div class="flex-grow">
						{#if p.popular}
							<span class="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide">Popular</span>
						{/if}
						<h3 class="text-2xl font-bold text-fg">{p.name}</h3>
						<p class="mt-4 text-4xl font-extrabold text-fg">{p.price}</p>
						<p class="mt-4 text-fg-muted leading-relaxed">{p.desc}</p>
					</div>
					<div class="mt-8">
						<Button variant={p.popular ? 'primary' : 'secondary'} class="w-full justify-center">{p.cta}</Button>
					</div>
				</Card>
			{/each}
		</div>
	</div>

	<div class="mt-24 text-center">
		<Heading level={2} size="2xl">Trusted by teams worldwide</Heading>
		<p class="mt-4 text-fg-muted">Join thousands of developers shipping faster with Demo Co.</p>
	</div>
</Container>
