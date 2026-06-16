import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async () => {
	return new Response('Method not allowed', { status: 405 });
};
