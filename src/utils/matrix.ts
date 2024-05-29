/* eslint-disable @typescript-eslint/ban-ts-comment */
import { EventTimeline, MatrixClient, Room } from 'matrix-js-sdk';
import { ChildEvent, KnockEvent } from '../types';


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
	const knockEvents: KnockEvent[] = stateEvents
		.filter((event) =>
			event.type === 'm.room.member' &&
			event.content.membership === 'knock'
		)
		.map((event) => {
			const time = new Date(event.origin_server_ts);
			const knock: KnockEvent = {
				roomId: event.room_id,
				// @ts-expect-error
				userId: event.user_id, // alternatively `sender` or `state_key`
				userDisplayName: event.content.displayname,
				reason: event.content.reason as (string | undefined),
				time
			};
			return knock;
		});

	return knockEvents;
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

				// @ts-expect-error
				const userId = event.user_id; // alternatively `sender`
				const { displayname } = await client.getProfileInfo(userId);

				const time = new Date(event.origin_server_ts);
				const childEvent: ChildEvent = {
					roomId: event.room_id,
					userId,
					userDisplayName: displayname,
					time,
					childRoomId,
					childRoomName: childRoom?.name,
				};
				return childEvent;
			})
	);

	return childEvents;
}
