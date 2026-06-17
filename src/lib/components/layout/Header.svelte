<script lang="ts">
	import LocaleSwitcher from './LocaleSwitcher.svelte';
	import ThemeSwitcher from './ThemeSwitcher.svelte';
	import { page } from '$app/stores';

	let { locale, t, user }: {
		locale: string;
		t: (key: string) => string;
		user?: { name: string; role: string } | null;
	} = $props();

	let menuOpen = $state(false);
	
	let currentPath = $derived($page.url.pathname);
	function isActive(href: string) {
		return currentPath === href || (href !== `/${locale}` && currentPath.startsWith(href));
	}
</script>

<header class="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
	<nav class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4" aria-label="Main navigation">
		<div class="flex items-center gap-8">
			<a href="/{locale}" class="text-lg font-bold text-fg">Demo Co.</a>
			<div class="hidden items-center gap-6 md:flex">
				<a href="/{locale}" class="text-sm {isActive(`/${locale}`) ? 'font-semibold text-fg' : 'text-fg-muted hover:text-fg'}">{t('nav.home')}</a>
				<a href="/{locale}/blog" class="text-sm {isActive(`/${locale}/blog`) ? 'font-semibold text-fg' : 'text-fg-muted hover:text-fg'}">{t('nav.blog')}</a>
				<a href="/{locale}/search" class="text-sm {isActive(`/${locale}/search`) ? 'font-semibold text-fg' : 'text-fg-muted hover:text-fg'}">{t('nav.search')}</a>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<ThemeSwitcher />
			<div class="hidden md:flex md:items-center md:gap-4">
				<LocaleSwitcher {locale} />
				{#if user}
					<span class="hidden md:block h-4 w-px bg-border" role="separator"></span>
					<span class="rounded-full bg-bg-muted px-3 py-1 text-sm text-fg-muted">{user.name} <span class="text-xs text-fg-muted/70">({user.role})</span></span>
					<a href="/{locale}/dashboard" class="text-sm font-medium text-primary hover:text-primary-hover">
						{t('nav.dashboard')}
					</a>
					<form action="/{locale}/logout" method="post">
						<button type="submit" class="cursor-pointer text-sm text-fg-muted hover:text-fg">{t('nav.logout')}</button>
					</form>
				{:else}
					<a href="/{locale}/login" class="text-sm font-medium {isActive(`/${locale}/login`) ? 'text-fg' : 'text-primary hover:text-primary-hover'}">
						{t('nav.login')}
					</a>
				{/if}
			</div>
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
				<a href="/{locale}" class="text-sm {isActive(`/${locale}`) ? 'font-semibold text-fg' : 'text-fg-muted hover:text-fg'}" onclick={() => (menuOpen = false)}>{t('nav.home')}</a>
				<a href="/{locale}/blog" class="text-sm {isActive(`/${locale}/blog`) ? 'font-semibold text-fg' : 'text-fg-muted hover:text-fg'}" onclick={() => (menuOpen = false)}>{t('nav.blog')}</a>
				<a href="/{locale}/search" class="text-sm {isActive(`/${locale}/search`) ? 'font-semibold text-fg' : 'text-fg-muted hover:text-fg'}" onclick={() => (menuOpen = false)}>{t('nav.search')}</a>
				
				<div class="my-2 border-t border-border pt-2">
					{#if user}
						<span class="block w-fit rounded-full bg-bg-muted px-3 py-1 text-sm text-fg-muted">{user.name} <span class="text-xs text-fg-muted/70">({user.role})</span></span>
						<a href="/{locale}/dashboard" class="block py-2 text-sm font-medium text-primary" onclick={() => (menuOpen = false)}>
							{t('nav.dashboard')}
						</a>
						<a href="/{locale}/dashboard/campaigns" class="block py-2 text-sm {isActive(`/${locale}/dashboard/campaigns`) ? 'font-semibold text-fg' : 'text-fg-muted hover:text-fg'}" onclick={() => (menuOpen = false)}>
							{t('dashboard.items.title')}
						</a>
						<form action="/{locale}/logout" method="post" class="mt-2">
							<button type="submit" class="w-full cursor-pointer py-2 text-left text-sm text-fg-muted hover:text-fg">
								{t('nav.logout')}
							</button>
						</form>
					{:else}
						<a href="/{locale}/login" class="block py-2 text-sm font-medium {isActive(`/${locale}/login`) ? 'text-fg' : 'text-primary'}" onclick={() => (menuOpen = false)}>
							{t('nav.login')}
						</a>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</header>
