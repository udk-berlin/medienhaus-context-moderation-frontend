import { Resource } from 'i18next';
import { projectTitle } from './constants';

export const resource: Resource = {
	de: {
		translation: {
			'HELLO': 'Hallo',
			'WELCOME_MSG': `Willkommen zu den ${projectTitle} für udk/cms!`,
			'MSG_NOT_A_MODERATOR': 'Du moderierst keine Spaces / Räume.',
			'SPACES_YOU_ARE_MOD_OF': 'Spaces / Räume, in denen du Moderator bist',
			'CONNECTED_ROOMS': 'Hinzugefügte Räume',
			'USERS_WANTING_TO_JOIN': 'User, die dem Space / Raum beitreten wollen',
			'EMPTY': 'leer',
			'REMOVE': 'Entfernen',
			'USER_ADDED_ROOM': '<strong>{{user}}</strong> hat Raum <strong>{{room}}</strong> hinzugefügt',
			'WANTS_TO_JOIN': 'möchte beitreten',
			'USER_KNOCK_REJECTED': '<strong>{{user}}</strong> wurde von <strong>{{by}}</strong> abgelehnt',
			'ROOM_REMOVED_BY': '<strong>{{user}}</strong>\'s Raum <strong>{{room}}</strong> wurde von <strong>{{by}}</strong> entfernt',
			'MESSAGE': 'Nachricht',
			'ACCEPT': 'akzeptieren',
			'REJECT': 'ablehnen',
		}
	},
	en: {
		translation: {
			'HELLO': 'Hello',
			'WELCOME_MSG': `Welcome to the udk/cms ${projectTitle}!`,
			'MSG_NOT_A_MODERATOR': 'You are not moderating any Spaces / Rooms.',
			'SPACES_YOU_ARE_MOD_OF': 'Spaces / Rooms you are a moderator of',
			'CONNECTED_ROOMS': 'Connected rooms',
			'USERS_WANTING_TO_JOIN': 'Users who want to join the space / room',
			'EMPTY': 'empty',
			'REMOVE': 'Remove',
			'USER_ADDED_ROOM': '<strong>{{user}}</strong> added room <strong>{{room}}</strong>',
			'WANTS_TO_JOIN': 'wants to enter',
			'USER_KNOCK_REJECTED': '<strong>{{user}}</strong> was denied entry by <strong>{{by}}</strong>',
			'ROOM_REMOVED_BY': '<strong>{{user}}</strong>\'s room <strong>{{room}}</strong> was removed by <strong>{{by}}</strong>',
			'MESSAGE': 'Message',
			'ACCEPT': 'accept',
			'REJECT': 'reject',
		}
	},
};
