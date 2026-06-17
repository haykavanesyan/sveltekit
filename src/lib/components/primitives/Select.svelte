<script lang="ts">
	import { getT } from '$lib/i18n/runtime.svelte';

	const t = getT();

	let { label, hideLabel = false, value = $bindable(), options, name, id, class: className = '', dropDownClassName = '', onchange, placeholder }: {
		label?: string;
		hideLabel?: boolean;
		value?: string | null | undefined;
		options: { value: string; label: string }[];
		name?: string;
		id?: string;
		class?: string;
		dropDownClassName?: string;
		onchange?: (e: CustomEvent<string>) => void;
		placeholder?: string;
	} = $props();

	let selectId = $derived(id || name || label?.toLowerCase().replace(/\s+/g, '-'));

	let open = $state(false);
	let triggerEl: HTMLButtonElement;
	let listEl = $state<HTMLDivElement | null>(null);
	let activeIdx = $state(-1);

	const selected = $derived(options.find((o) => o.value === value));
	const displayLabel = $derived(selected?.label || placeholder || '');

	function toggle() {
		open = !open;
		if (open) activeIdx = options.findIndex((o) => o.value === value);
	}

	function select(v: string) {
		if (v !== value) {
			value = v;
			onchange?.(new CustomEvent('change', { detail: v, bubbles: true }));
		}
		open = false;
		triggerEl.focus();
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open) {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
				e.preventDefault();
				open = true;
				activeIdx = options.findIndex((o) => o.value === value);
			}
			return;
		}
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				activeIdx = Math.min(activeIdx + 1, options.length - 1);
				scrollIntoView(activeIdx);
				break;
			case 'ArrowUp':
				e.preventDefault();
				activeIdx = Math.max(activeIdx - 1, 0);
				scrollIntoView(activeIdx);
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				if (activeIdx >= 0 && activeIdx < options.length) {
					select(options[activeIdx].value);
				}
				break;
			case 'Escape':
				e.preventDefault();
				open = false;
				triggerEl.focus();
				break;
			case 'Tab':
				open = false;
				break;
		}
	}

	function scrollIntoView(idx: number) {
		requestAnimationFrame(() => {
			const el = listEl?.children[idx] as HTMLElement | undefined;
			el?.scrollIntoView({ block: 'nearest' });
		});
	}

	function onPointerDown(e: PointerEvent) {
		if (open && triggerEl && !triggerEl.contains(e.target as Node) && listEl && !listEl.contains(e.target as Node)) {
			open = false;
		}
	}

	$effect(() => {
		if (!open || !triggerEl || !listEl) return;
		const currentList = listEl;

		const main = document.querySelector('main');
		main?.appendChild(currentList);

		const gap = 4;

		function position() {
			const tr = triggerEl.getBoundingClientRect();
			const top = tr.bottom + window.scrollY + gap;
			const left = tr.left + window.scrollX;

			currentList.style.position = 'absolute';
			currentList.style.top = `${top}px`;
			currentList.style.left = `${left}px`;
			currentList.style.minWidth = `${tr.width}px`;
			currentList.style.width = 'auto';

			requestAnimationFrame(() => {
				const lr = currentList.getBoundingClientRect();

				if (lr.bottom > window.innerHeight && tr.top > lr.height) {
					currentList.style.top = `${tr.top + window.scrollY - gap - lr.height}px`;
				}
				const overflowRight = lr.right - window.innerWidth;
				if (overflowRight > 0) {
					currentList.style.left = `${Math.max(0, parseFloat(currentList.style.left) - overflowRight)}px`;
				}
			});
		}

		position();

		window.addEventListener('scroll', position, { passive: true });
		window.addEventListener('resize', position, { passive: true });

		return () => {
			currentList?.remove();
			window.removeEventListener('scroll', position);
			window.removeEventListener('resize', position);
		};
	});
</script>

<svelte:window onpointerdown={onPointerDown} />

<div class={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
	{#if label}
		<label for={selectId} class={["text-sm font-medium text-fg", hideLabel ? "sr-only" : ""].filter(Boolean).join(' ')}>{label}</label>
	{/if}
	{#if !label || hideLabel}
		<span id={`${selectId}-label`} class="sr-only">{label || name || selectId}</span>
	{/if}
	<div>
		<button
			bind:this={triggerEl}
			type="button"
			id={selectId}
			name={name}
			role="combobox"
			aria-expanded={open}
			aria-controls={`${selectId}-listbox`}
			aria-haspopup="listbox"
			aria-activedescendant={activeIdx >= 0 ? `${selectId}-opt-${activeIdx}` : undefined}
			aria-labelledby={(!label || hideLabel) ? `${selectId}-label` : undefined}
			onclick={toggle}
			onkeydown={onKeydown}
			class="flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-border bg-bg px-3 text-sm text-fg transition-colors hover:border-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:opacity-50"
		>
			<span class={[displayLabel ? 'text-fg' : 'text-fg-muted'].filter(Boolean).join(' ')}>
				{displayLabel || t('common.selectPlaceholder')}
			</span>
			<svg
				class="h-4 w-4 shrink-0 text-fg-muted transition-transform {open ? 'rotate-180' : ''}"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<path d="M6 9l6 6 6-6" />
			</svg>
		</button>
	</div>
</div>

{#if open}
	<div
		bind:this={listEl}
		class={["z-30 rounded-md border border-border bg-bg py-1 shadow-lg", dropDownClassName].filter(Boolean).join(' ')}
		role="listbox"
		id={`${selectId}-listbox`}
	>
		{#each options as opt, i (opt.value || i)}
			<button
				type="button"
				role="option"
				id={`${selectId}-opt-${i}`}
				aria-selected={opt.value === value}
				class="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-sm transition-colors {opt.value === value ? 'bg-primary/10 text-primary' : 'text-fg hover:bg-bg-muted'} {i === activeIdx ? 'bg-bg-muted' : ''}"
				onclick={() => select(opt.value)}
				onmouseenter={() => (activeIdx = i)}
			>
				<svg
					class="h-4 w-4 shrink-0 {opt.value === value ? 'opacity-100' : 'opacity-0'}"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<path d="M5 13l4 4L19 7" />
				</svg>
				<span>{opt.label}</span>
			</button>
		{/each}
		{#if options.length === 0}
			<div class="whitespace-nowrap px-3 py-2 text-sm text-fg-muted">{t('common.noOptions')}</div>
		{/if}
	</div>
{/if}
