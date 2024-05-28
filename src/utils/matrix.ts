import { EventTimeline, Room } from 'matrix-js-sdk';


export async function determineUserRooms(
	rooms: Room[],
	listedRoomsIds: string[],
	user_id: string
) {
	const moderatorRooms: Room[] = [];

	rooms.forEach((room) => {
		// only handle listed rooms
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
