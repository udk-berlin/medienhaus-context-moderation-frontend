/* eslint-disable @typescript-eslint/ban-ts-comment */
import { EventTimeline, MatrixClient, Room } from 'matrix-js-sdk';
import { ChildEvent, KnockEvent, KnockRejectedEvent } from '../types';
import { KnownMembership } from 'matrix-js-sdk/lib/types';
import { UNKNOWN } from '../constants';


export async function getPublicRooms(client: MatrixClient) {
	const roomDirectory = (
		await client.publicRooms({ limit: 99999 })
	).chunk;
	return roomDirectory;
}


export async function determineUserRooms(
	rooms: Room[],
	listedRoomsIds: string[],
	user_id: string
) {
	const moderatorRooms: Room[] = [];

	rooms.forEach((room) => {
		// only handle listed rooms
		// TODO: keep this?
		if (!listedRoomsIds.includes(room.roomId)) {
			// ignore
			return;
		}

		// deprecated
		// const powerLevels = room.currentState.getStateEvents('m.room.power_levels', '');
		const currentState = room.getLiveTimeline().getState(EventTimeline.FORWARDS);
		if (!currentState) {
			console.error('Unable to get state for room: ' + room.name);
			return;
		}

		const powerLevels = currentState.getStateEvents('m.room.power_levels', '');
		if (!powerLevels) {
			console.error('Unable to get power levels for room: ' + room.name);
			return;
		} else {
			const content = powerLevels.getContent();
			const userPowerLevel = content.users[user_id];
			if (isNaN(userPowerLevel)) {
				console.error('Unable to determine user power level in room: ' + room.name);
				return;
			}
			const moderatorLevel = 50; // TODO: or does medienhaus use a non-default value?
			if (userPowerLevel >= moderatorLevel) {
				moderatorRooms.push(room);
			}
		}
	});

	return moderatorRooms;
}


export async function getKnockEvents(
	client: MatrixClient,
	roomId: string,
) {
	const stateEvents = await client.roomState(roomId);

	// ban | invite | join | knock | leave
	const membershipTypes = [KnownMembership.Knock, KnownMembership.Leave];

	const knockEvents: Array<Promise<KnockEvent | KnockRejectedEvent>> = stateEvents
		.filter((event) =>
			event.type === 'm.room.member' &&
			membershipTypes.includes(event.content.membership as KnownMembership)
		)
		.map(async (event) => {
			const time = new Date(event.origin_server_ts);

			// user knocked
			if (event.content.membership === KnownMembership.Knock) {
				const userDisplayName = event.content.displayname || `(${UNKNOWN})`;
				const knock: KnockEvent = {
					roomId: event.room_id,
					userId: event.state_key,
					userDisplayName,
					reason: event.content.reason as (string | undefined),
					time
				};
				return knock;
			}

			// user's knock was rejected
			if (
				event.content.membership === KnownMembership.Leave &&
				event.sender !== event.state_key
			) {
				const senderName = (
					await client.getProfileInfo(event.sender)
				).displayname || `(${UNKNOWN})`;
				const userDisplayName = event.content.displayname || `(${UNKNOWN})`;
				const knockRejected: KnockRejectedEvent = {
					roomId: event.room_id,
					userId: event.state_key,
					userDisplayName,
					time,
					rejectedByUserId: event.sender,
					rejectedByUserName: senderName,
				};
				return knockRejected;
			}

			return undefined as unknown as (KnockEvent | KnockRejectedEvent);
		})
		.filter((it) => (it !== undefined));

	return Promise.all(knockEvents);
}


export async function getChildEvents(
	client: MatrixClient,
	roomId: string,
) {
	const stateEvents = await client.roomState(roomId);
	const childEvents: ChildEvent[] = await Promise.all(
		stateEvents
			.filter((event) => {
				const { content, type } = event;
				return (
					type === 'm.space.child' &&
					Object.keys(content || {}).length > 0 // 'add' events only
					// TODO: should we also show 'remove' events?
				);
			})
			.map(async (event) => {
				const childRoomId = event.state_key;
				const childRoom = client.getRoom(childRoomId);
				const childRoomName = childRoom?.name || `(${UNKNOWN})`;

				// @ts-expect-error
				const userId = event.user_id; // alternatively `sender`
				const { displayname } = await client.getProfileInfo(userId);
				const userDisplayName = displayname || `(${UNKNOWN})`;

				const time = new Date(event.origin_server_ts);
				const childEvent: ChildEvent = {
					roomId: event.room_id,
					userId,
					userDisplayName,
					time,
					childRoomId,
					childRoomName,
				};
				return childEvent;
			})
	);

	return childEvents;
}
