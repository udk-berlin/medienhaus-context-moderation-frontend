import { Resource } from 'i18next';

export const resource: Resource = {
	de: {
		translation: {
			'HELLO': 'Hallo',
			'MSG_NOT_A_MODERATOR': 'Du moderierst keine Kontexte.',
			'SPACES_YOU_ARE_MOD_OF': 'Kontexte, in denen du Moderator:in bist',
			'CONNECTED_ROOMS': 'Freigegebene Items (Events/Projekte)',
			'REMOVED_ROOMS': 'Entfernte Items (Events/Projekte)',
			'USERS_WANTING_TO_JOIN': 'Nutzer:innen, die in diesem Kontext veröffentlichen möchten',
			'REJECTED_USERS': 'Abgelehnte Nutzer:innen',
			'NONE': 'keine',
			'REMOVE': 'Entfernen',
			'USER_ADDED_ROOM': '<strong>{{user}}</strong> hat <strong>{{room}}</strong> veröffentlicht',
			'WANTS_TO_JOIN': 'möchte in diesem Kontext veröffentlichen',
			'USER_KNOCK_REJECTED': '<strong>{{user}}</strong> wurde von <strong>{{by}}</strong> abgelehnt',
			'ROOM_REMOVED_BY': '<strong>{{room}}</strong> von <strong>{{user}}</strong> wurde von Moderator:in <strong>{{by}}</strong> entfernt',
			'MESSAGE': 'Nachricht',
			'ACCEPT': 'akzeptieren',
			'REJECT': 'ablehnen',
		}
	},
	en: {
		translation: {
			'HELLO': 'Hello',
			'MSG_NOT_A_MODERATOR': 'You are not moderating any contexts.',
			'SPACES_YOU_ARE_MOD_OF': 'Contexts you are a moderator of',
			'CONNECTED_ROOMS': 'Approved items (events/projects)',
			'REMOVED_ROOMS': 'Removed items (events/projects)',
			'USERS_WANTING_TO_JOIN': 'Users who want to publish in this context',
			'REJECTED_USERS': 'Rejected users',
			'NONE': 'none',
			'REMOVE': 'Remove',
			'USER_ADDED_ROOM': '<strong>{{user}}</strong> published <strong>{{room}}</strong>',
			'WANTS_TO_JOIN': 'wants to pulish in this context',
			'USER_KNOCK_REJECTED': '<strong>{{user}}</strong> was rejected by <strong>{{by}}</strong>',
			'ROOM_REMOVED_BY': '<strong>{{room}}</strong> by <strong>{{user}}</strong> was removed by moderator <strong>{{by}}</strong>',
			'MESSAGE': 'Message',
			'ACCEPT': 'accept',
			'REJECT': 'reject',
		}
	},
};
