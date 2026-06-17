<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import Card from '$lib/components/primitives/Card.svelte';
	import Input from '$lib/components/primitives/Input.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { getT } from '$lib/i18n/runtime.svelte';
	import { LoginSchema } from '$lib/schemas/auth';
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	const t = getT();

	let emailError = $state('');
	let passwordError = $state('');

	function validate(e: SubmitEvent) {
		const formData = new FormData(e.target as HTMLFormElement);
		const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
		if (!parsed.success) {
			const errors = parsed.error.flatten().fieldErrors;
			emailError = errors.email?.[0] || '';
			passwordError = errors.password?.[0] || '';
			e.preventDefault();
		} else {
			emailError = '';
			passwordError = '';
		}
	}
</script>

<SeoHead
	title={t('login.title')}
	description="Sign in to your account"
	locale={data.locale}
	path="/login"
/>

<Container size="sm" class="py-20">
	<Card padding="lg" class="mx-auto max-w-md">
		<h1 class="text-2xl font-bold text-fg">{t('login.title')}</h1>

		<form method="post" action="?/login" use:enhance class="mt-6 flex flex-col gap-4" onsubmit={validate}>
			{#if form?.error && !form?.error.startsWith('login.')}
				<p class="rounded-md bg-danger/10 p-3 text-sm text-danger" role="alert">{form.error}</p>
			{/if}
			{#if form?.error === 'login.error'}
				<p class="rounded-md bg-danger/10 p-3 text-sm text-danger" role="alert">{t('login.error')}</p>
			{/if}

			<Input
				name="email"
				type="email"
				label={t('login.email')}
				placeholder="admin@demo.test"
				value={form?.fields?.email ?? ''}
				error={emailError}
			/>
			<Input
				name="password"
				type="password"
				label={t('login.password')}
				placeholder="••••••••"
				error={passwordError}
			/>
			<Button type="submit" variant="primary" class="w-full">{t('login.submit')}</Button>
		</form>
	</Card>
</Container>
