import { EventTimeline, MatrixClient, Room } from 'matrix-js-sdk';
import { ChildEvent, ChildRemovedEvent, KnockEvent, KnockRejectedEvent } from '../types';
import { KnownMembership } from 'matrix-js-sdk/lib/types';
import { UNKNOWN } from '../constants';


export async function getRoomName(client: MatrixClient, roomId: string) {
	try {
		const { name } = await client.getStateEvent(roomId, 'm.room.name', '');
		if (name) {
			return name;
		}
	} catch (err) {
		console.error(err);
	}
	return null;
}


export async function determineModeratedRooms(
	rooms: Room[],
	user_id: string
) {
	const moderatorRooms: Room[] = [];

	rooms.forEach((room) => {
		// deprecated
		// const powerLevels = room.currentState.getStateEvents('m.room.power_levels', '');
		const currentState = room.getLiveTimeline().getState(EventTimeline.FORWARDS);
		const moderatorLevel = 50; // assume default value
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
			if (userPowerLevel >= moderatorLevel && currentState?.events?.get('dev.medienhaus.meta')?.get('')?.event?.content?.type === 'context') {
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

			const userId = event.state_key;
			const userDisplayName = (
				await client.getProfileInfo(userId, 'displayname')
			).displayname || `(${UNKNOWN})`;

			const common: Pick<KnockEvent, 'roomId' | 'userId' | 'userDisplayName' | 'time'> = {
				roomId: event.room_id,
				userId,
				userDisplayName,
				time
			};

			// user knocked
			if (event.content.membership === KnownMembership.Knock) {
				const knock: KnockEvent = {
					...common,
					reason: event.content.reason as (string | undefined),
				};
				return knock;
			}

			// user's knock was rejected
			if (
				event.content.membership === KnownMembership.Leave &&
				event.sender !== event.state_key
			) {
				const senderName = (
					await client.getProfileInfo(event.sender, 'displayname')
				).displayname || `(${UNKNOWN})`;

				const knockRejected: KnockRejectedEvent = {
					...common,
					rejectedByUserId: event.sender,
					rejectedByUserName: senderName,
				};
				return knockRejected;
			}

			return undefined as unknown as (KnockEvent | KnockRejectedEvent);
		});

	return (await Promise.all(knockEvents))
		.filter((it) => (it !== undefined))
		.reverse();
}


export async function getChildEvents(
	client: MatrixClient,
	roomId: string,
) {
	const stateEvents = await client.roomState(roomId);
	const childEvents: Array<Promise<ChildEvent | ChildRemovedEvent>> = stateEvents
		.filter((event) => {
			const { type } = event;
			return (type === 'm.space.child');
		})
		.map(async (event) => {
			const { content } = event;
			const wasAdded = Object.keys(content || {}).length > 0;

			const childRoomId = event.state_key;

			const childRoomName = (
				await getRoomName(client, childRoomId)
			) || `(${UNKNOWN})`;

			const senderName = (
				await client.getProfileInfo(event.sender)
			).displayname || `(${UNKNOWN})`;

			const time = new Date(event.origin_server_ts);
			const common = {
				time,
				roomId: event.room_id,
				childRoomId,
				childRoomName,
			};

			if (wasAdded) {
				const childAdded: ChildEvent = {
					...common,
					userId: event.sender,
					userDisplayName: senderName,
				};
				return childAdded;
			} else {
				const prevSender = event.unsigned?.prev_sender;

				if (prevSender === event.sender) {
					// removed by the same user
					return undefined as unknown as (ChildEvent | ChildRemovedEvent);
				}

				let prevSenderName = `(${UNKNOWN})`;
				if (prevSender) {
					prevSenderName = (
						await client.getProfileInfo(prevSender)
					).displayname || `(${UNKNOWN})`;
				}
				const senderName = (
					await client.getProfileInfo(event.sender)
				).displayname || `(${UNKNOWN})`;
				const childRemoved: ChildRemovedEvent = {
					...common,
					userId: prevSender as string,
					userDisplayName: prevSenderName,
					removedByUserId: event.sender,
					removedByUserName: senderName
				};
				return childRemoved;
			}
		});

	return (await Promise.all(childEvents))
		.filter((it) => (it !== undefined))
		.reverse();
}
