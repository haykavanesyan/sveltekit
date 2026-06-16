<script lang="ts">
	import LocaleSwitcher from './LocaleSwitcher.svelte';

	let { locale, t, user }: {
		locale: string;
		t: (key: string) => string;
		user?: { name: string; role: string } | null;
	} = $props();

	let menuOpen = $state(false);
</script>

<header class="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
	<nav class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4" aria-label="Main navigation">
		<div class="flex items-center gap-8">
			<a href="/{locale}" class="text-lg font-bold text-fg">Demo Co.</a>
			<div class="hidden items-center gap-6 md:flex">
				<a href="/{locale}" class="text-sm text-fg-muted hover:text-fg">{t('nav.home')}</a>
				<a href="/{locale}/blog" class="text-sm text-fg-muted hover:text-fg">{t('nav.blog')}</a>
				<a href="/{locale}/search" class="text-sm text-fg-muted hover:text-fg">{t('nav.search')}</a>
			</div>
		</div>
		<div class="flex items-center gap-4">
			<LocaleSwitcher {locale} />
			{#if user}
				<a href="/{locale}/dashboard" class="text-sm font-medium text-primary hover:text-primary-hover">
					{t('nav.dashboard')}
				</a>
				<form action="/{locale}/logout" method="post">
					<button type="submit" class="cursor-pointer text-sm text-fg-muted hover:text-fg">{t('nav.logout')}</button>
				</form>
			{:else}
				<a href="/{locale}/login" class="text-sm font-medium text-primary hover:text-primary-hover">
					{t('nav.login')}
				</a>
			{/if}
			<button
				class="inline-flex cursor-pointer items-center md:hidden"
				onclick={() => (menuOpen = !menuOpen)}
				aria-label="Toggle navigation menu"
				aria-expanded={menuOpen}
			>
				<svg class="h-6 w-6 text-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					{#if menuOpen}
						<path d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>
		</div>
	</nav>
	{#if menuOpen}
		<div class="border-t border-border bg-bg px-4 py-4 md:hidden">
			<div class="flex flex-col gap-3">
				<a href="/{locale}" class="text-sm text-fg-muted hover:text-fg" onclick={() => (menuOpen = false)}>{t('nav.home')}</a>
				<a href="/{locale}/blog" class="text-sm text-fg-muted hover:text-fg" onclick={() => (menuOpen = false)}>{t('nav.blog')}</a>
				<a href="/{locale}/search" class="text-sm text-fg-muted hover:text-fg" onclick={() => (menuOpen = false)}>{t('nav.search')}</a>
			</div>
		</div>
	{/if}
</header>
