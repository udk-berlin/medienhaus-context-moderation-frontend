export type AppStatus = 'logged-out' | 'logged-in' | 'initial-sync' | 'ready';

export type User = {
	userId: string
	displayName?: string
};
