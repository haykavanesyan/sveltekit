declare module '$mocks/*.json' {
	const value: unknown;
	export default value;
}

declare module '$mocks/posts.json' {
	const value: import('./schemas/post').Post[];
	export default value;
}

declare module '$mocks/items.json' {
	const value: import('./schemas/item').Item[];
	export default value;
}

declare module '$mocks/users.json' {
	const value: import('./schemas/user').User[];
	export default value;
}

declare module '$mocks/tags.json' {
	const value: import('./schemas/tag').Tag[];
	export default value;
}

declare module '$mocks/i18n.en.json' {
	const value: Record<string, string>;
	export default value;
}

declare module '$mocks/i18n.de.json' {
	const value: Record<string, string>;
	export default value;
}
