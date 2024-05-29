export type AppStatus = 'logged-out' | 'logged-in' | 'initial-sync' | 'ready' | 'not-a-moderator';

export type User = {
	userId: string
	displayName?: string
};

export type KnockEvent = {
	roomId: string;
	userId: string;
	userDisplayName?: string;
	reason?: string;
	time: Date;
}

export type ChildEvent = {
	roomId: string;
	userId: string;
	userDisplayName?: string;
	childRoomId: string;
	childRoomName?: string;
	time: Date;
}
