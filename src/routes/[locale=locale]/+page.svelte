<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import Heading from '$lib/components/primitives/Heading.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import Card from '$lib/components/primitives/Card.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { getT, getLocale } from '$lib/i18n/runtime.svelte';

	const t = getT();
	const locale = getLocale();

	const features = $derived([
		{ title: t('home.features.0.title'), desc: t('home.features.0.desc') },
		{ title: t('home.features.1.title'), desc: t('home.features.1.desc') },
		{ title: t('home.features.2.title'), desc: t('home.features.2.desc') },
		{ title: t('home.features.3.title'), desc: t('home.features.3.desc') }
	]);

	const pricing = $derived([
		{ name: t('home.pricing.0.name'), price: t('home.pricing.0.price'), desc: t('home.pricing.0.desc'), cta: t('home.pricing.0.cta') },
		{ name: t('home.pricing.1.name'), price: t('home.pricing.1.price'), desc: t('home.pricing.1.desc'), cta: t('home.pricing.1.cta'), popular: true },
		{ name: t('home.pricing.2.name'), price: t('home.pricing.2.price'), desc: t('home.pricing.2.desc'), cta: t('home.pricing.2.cta') }
	]);

	const testimonials = $derived([
		{ quote: t('home.testimonials.0.quote'), name: t('home.testimonials.0.name'), role: t('home.testimonials.0.role'), initials: 'SK', color: 'bg-primary/10 text-primary' },
		{ quote: t('home.testimonials.1.quote'), name: t('home.testimonials.1.name'), role: t('home.testimonials.1.role'), initials: 'MR', color: 'bg-success/10 text-success' },
		{ quote: t('home.testimonials.2.quote'), name: t('home.testimonials.2.name'), role: t('home.testimonials.2.role'), initials: 'AL', color: 'bg-warning/10 text-warning' }
	]);

	const orgLd = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: t('brand.name'),
		url: `https://example.com/${locale}`,
		description: t('seo.description')
	}));
</script>

<SeoHead
	title={t('home.hero.title')}
	description={t('home.hero.subtitle')}
	{locale}
	path=""
	jsonLd={orgLd}
/>

<Container size="lg" class="py-20">
	<div class="mx-auto max-w-3xl text-center">
		<Heading level={1} size="3xl">{t('home.hero.title')}</Heading>
		<p class="mt-4 text-lg text-fg-muted">{t('home.hero.subtitle')}</p>
		<div class="mt-8 flex items-center justify-center gap-4">
			<Button size="lg">{t('home.hero.cta')}</Button>
			<Button variant="secondary" size="lg">{t('home.hero.learnMore')}</Button>
		</div>
	</div>

	<div class="mt-24">
		<Heading level={2} size="2xl" class="mb-12 text-center">{t('home.features.title')}</Heading>
		<div class="grid gap-8 md:grid-cols-2">
			{#each features as f (f.title)}
				<Card padding="lg" class="border-border hover:border-primary transition-colors">
					<h3 class="text-xl font-semibold text-fg">{f.title}</h3>
					<p class="mt-3 text-fg-muted">{f.desc}</p>
				</Card>
			{/each}
		</div>
	</div>

	<div class="mt-24">
		<Heading level={2} size="2xl" class="mb-12 text-center">{t('home.pricing.title')}</Heading>
		<div class="grid gap-8 md:grid-cols-3 items-stretch">
			{#each pricing as p (p.name)}
				<Card padding="lg" shadow={true} class="flex flex-col border-border">
					<div class="flex-grow">
						{#if p.popular}
							<span class="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide">{t('home.pricing.popular')}</span>
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

	<div class="mt-24">
		<Heading level={2} size="2xl" class="mb-12 text-center">{t('home.testimonials.title')}</Heading>
		<div class="grid gap-8 md:grid-cols-3">
			{#each testimonials as tst (tst.initials)}
				<Card padding="lg" class="border-border">
					<p class="text-sm italic text-fg-muted leading-relaxed">"{tst.quote}"</p>
					<div class="mt-4 flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold {tst.color}">{tst.initials}</div>
						<div>
							<p class="text-sm font-semibold text-fg">{tst.name}</p>
							<p class="text-xs text-fg-muted">{tst.role}</p>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	</div>
</Container>
