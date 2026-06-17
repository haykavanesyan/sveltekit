import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { focusTrap } from '$lib/actions/focusTrap';

describe('Dialog focusTrap action', () => {
	let container: HTMLDivElement;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
	});

	it('returns undefined when disabled', () => {
		const result = focusTrap(container, false);
		expect(result).toBeUndefined();
	});

	it('focuses first focusable element', () => {
		container.innerHTML = `<button id="first">First</button><button id="last">Last</button>`;
		const first = container.querySelector('#first') as HTMLElement;
		focusTrap(container, true);
		expect(document.activeElement).toBe(first);
	});

	it('wraps focus from last to first on Tab', () => {
		container.innerHTML = `<button id="first">First</button><button id="last">Last</button>`;
		const first = container.querySelector('#first') as HTMLElement;
		const last = container.querySelector('#last') as HTMLElement;
		focusTrap(container, true);
		last.focus();
		last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
		expect(document.activeElement).toBe(first);
	});

	it('wraps focus from first to last on Shift+Tab', () => {
		container.innerHTML = `<button id="first">First</button><button id="last">Last</button>`;
		const first = container.querySelector('#first') as HTMLElement;
		const last = container.querySelector('#last') as HTMLElement;
		focusTrap(container, true);
		first.focus();
		first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
		expect(document.activeElement).toBe(last);
	});

	it('destroy removes event listener', () => {
		container.innerHTML = `<button id="btn">Button</button>`;
		const result = focusTrap(container, true);
		const addSpy = vi.spyOn(container, 'removeEventListener');
		result?.destroy();
		expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
	});
});
