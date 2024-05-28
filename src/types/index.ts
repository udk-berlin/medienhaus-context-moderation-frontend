export type AppStatus = 'logged-out' | 'logged-in' | 'initial-sync' | 'ready' | 'not-a-moderator';

export type User = {
	userId: string
	displayName?: string
};

export type KnockRequest = {
	userId: string;
	userDisplayName?: string;
	reason?: string;
	time: Date;
}
