import { Resource } from 'i18next';
import { projectTitle } from './constants';

export const resource: Resource = {
	de: {
		translation: {
			'HELLO': 'Hallo',
			'WELCOME_MSG': `Willkommen zu den ${projectTitle} für udk/cms!`,
			'MSG_NOT_A_MODERATOR': 'Du moderierst keine Spaces / Rooms.',
			'SPACES_YOU_ARE_MOD_OF': 'Spaces / Rooms, in denen du Moderator bist',
			'CONNECTED_ROOMS': 'Hinzugefügte Räume',
			'USERS_WANTING_TO_JOIN': 'User, die dem Space / Room beitreten wollen',
			'EMPTY': 'leer',
			'REMOVE': 'Entfernen',
			'USER_ADDED_ROOM': '<strong>{{user}}</strong> hat Room <strong>{{room}}</strong> hinzugefügt',
			'WANTS_TO_JOIN': 'möchte beitreten',
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
			'MESSAGE': 'Message',
			'ACCEPT': 'accept',
			'REJECT': 'reject',
		}
	},
};
