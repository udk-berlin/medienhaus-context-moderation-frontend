import { Fragment, ReactNode, useEffect, useState } from 'react';
import { ClientEvent, EventType, MatrixClient, MatrixError, Room, RoomStateEvent, SyncState } from 'matrix-js-sdk';
import { useTranslation } from 'react-i18next';

import Login from './Login';
import Main from './Main';
import { Loading } from './Loading';
import LanguageSelector from './LanguageSelector';

import { determineModeratedRooms, getChildEvents, getKnockEvents } from '../utils/matrix';
import { AppStatus, ChildEvent, ChildrenByRoom, KnockEvent, KnocksByRoom, User } from '../types';
import { projectTitle, lsAccessToken, lsUserId } from '../constants';
import { getDifferenceInDays } from '../utils/date';


interface AppProps {
	client: MatrixClient
}


function App({ client }: AppProps): ReactNode {
	const { t } = useTranslation();

	const [user, setUser] = useState<User | null>(null);
	const [loginErrors, setLoginErrors] = useState<string[]>([]);
	const [status, setStatus] = useState<AppStatus>('logged-out');
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [moderatorRooms, setModeratorRooms] = useState<Room[]>([]);
	const [knocksByRoom, setKnocksByRoom] = useState<KnocksByRoom>({});
	const [childrenByRoom, setChildrenByRoom] = useState<ChildrenByRoom>({});

	const start = async (userId: string) => {
		// set user info
		const { displayname } = await client.getProfileInfo(userId);
		setUser({
			userId,
			displayName: displayname
		});

		client.once(ClientEvent.Sync, async (state: string) => {
			if (state === SyncState.Prepared) {
				console.log('Sync complete');

				let moderatorRooms = await updateModeratorRooms();

				// listen to events so that we can refresh the data accordingly
				client.on(RoomStateEvent.Members, async (_event, _state, member) => {
					if (member.userId === client.getUserId()) {
						// the user's membership changed
						moderatorRooms = await updateModeratorRooms();
					} else {
						// someone else's membership changed
						updateEventsData(moderatorRooms);
					}
				});
				client.on(RoomStateEvent.Events, async (event) => {
					const type = event.getType();
					if (type === 'm.room.power_levels') {
						const content = event.getContent();
						const userId = client.getUserId()!;
						const newPowerLevel = content.users[userId];
						if (newPowerLevel !== undefined) {
							// the user's power level changed
							moderatorRooms = await updateModeratorRooms();
						}
					} else if (type === 'm.space.child') {
						// connected rooms changed
						updateEventsData(moderatorRooms);
					}
				});
			} else {
				console.error('Sync failed!');
			}
		});

		setStatus('initial-sync');
		client.startClient();
	};

	useEffect(
		() => {
			// check for credentials in localstorage
			const userId = localStorage.getItem(lsUserId);
			const token = localStorage.getItem(lsAccessToken);
			if (token && userId) {
				(async () => {
					try {
						client.credentials = { userId };
						client.setAccessToken(token);
						setStatus('logged-in');
						start(userId);
					} catch (err) {
						console.log('Failed to auto-login');
						console.error(err);
						logout();
					}
				})();
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	const updateModeratorRooms = async () => {
		console.info('Updating rooms data...');

		const userId = client.getUserId();
		console.assert(userId !== null);
		if (userId === null) {
			console.log('Failed to get user id. This should not happen.');
			return [];
		}

		setIsRefreshing(true);

		// filter rooms
		let maxRoomAgeInDays = -1;
		try {
			maxRoomAgeInDays = parseInt(import.meta.env.VITE_MAX_ROOM_AGE_DAYS);
		} catch (err) {
			console.error(`Unable to set max room age: ${err}`);
		}
		const now = Date.now();
		const rooms = client.getRooms()
			.filter((room) => {
				// when user is the only current member: ignore
				// for moderated spaces there will be at least one other member: a bot
				const memberIds = Object.keys(room.currentState.members);
				if (memberIds.length === 1 && memberIds[0] === userId) {
					return false;
				}
				return true;
			})
			.filter((room) => {
				// filter by rooms age
				if (maxRoomAgeInDays === -1) {
					return true;
				}
				const createEvent = room.currentState.getStateEvents('m.room.create', '');
				if (createEvent === null) {
					console.error('Unable to get room creation date');
					return true;
				}
				const diffInDays = getDifferenceInDays(now, createEvent.getTs());
				return diffInDays <= maxRoomAgeInDays;
			});

		// get rooms the user is a moderator of
		const moderatorRooms = await determineModeratedRooms(rooms, userId);
		setModeratorRooms(moderatorRooms);

		if (!moderatorRooms.length) {
			setStatus('not-a-moderator');
		} else {
			updateEventsData(moderatorRooms);
			setStatus('ready');
		}

		setIsRefreshing(false);

		return moderatorRooms;
	};

	const updateEventsData = async (moderatorRooms: Room[]) => {
		console.info('Updating events data...');

		setIsRefreshing(true);

		const knocksByRoom: KnocksByRoom = {};
		const childrenByRoom: ChildrenByRoom = {};
		for (const room of moderatorRooms) {
			knocksByRoom[room.roomId] = await getKnockEvents(client, room.roomId);
			childrenByRoom[room.roomId] = await getChildEvents(client, room.roomId);
		}
		setKnocksByRoom(knocksByRoom);
		setChildrenByRoom(childrenByRoom);

		setIsRefreshing(false);
	};

	const acceptKnock = async (knockEvent: KnockEvent) => {
		await client.invite(knockEvent.roomId, knockEvent.userId);
		updateEventsData(moderatorRooms);
	};

	const rejectKnock = async (knockEvent: KnockEvent) => {
		await client.kick(knockEvent.roomId, knockEvent.userId, /* 'Knock request denied.' */);
		updateEventsData(moderatorRooms);
	};

	const removeChild = async (childEvent: ChildEvent) => {
		const spaceId = childEvent.roomId;
		const childRoomId = childEvent.childRoomId;
		try {
			await client.sendStateEvent(
				spaceId,
				EventType.SpaceChild,
				{}, // empty content to remove the room from the space
				childRoomId
			);
		} catch (err) {
			console.error(`Failed to remove room ${childRoomId} from space ${spaceId}:`, err);
		}
		updateEventsData(moderatorRooms);
	};

	const onLoginSubmit = async (user: string, password: string) => {
		console.assert(client != null);
		if (client == null) { return; }

		setLoginErrors([]);

		try {
			const { access_token, user_id } = await client.loginWithPassword(user, password);
			client.setAccessToken(access_token);
			localStorage.setItem(lsAccessToken, access_token);
			localStorage.setItem(lsUserId, user_id);
			setStatus('logged-in');
			start(user_id);
		} catch (err) {
			if (err instanceof MatrixError) {
				console.error('Login failed:', err.data.error);
				setLoginErrors([err.data.error!]);
			}
			console.error(err);
		}
	};

	const logout = async () => {
		setStatus('logged-out');
		setUser(null);
		localStorage.removeItem(lsAccessToken);
		localStorage.removeItem(lsUserId);
		await client.logout(true);
		client.stopClient();
	};

	const refresh: React.MouseEventHandler<HTMLElement> = (event) => {
		event.preventDefault();
		updateModeratorRooms();
	};

	let content: ReactNode = null;
	if (status === 'logged-out') {
		content = <Login
			onSubmit={onLoginSubmit}
			errors={loginErrors}
		/>;
	} else if (status === 'initial-sync') {
		content = <Loading />;
	} else if (status === 'not-a-moderator') {
		content = t('MSG_NOT_A_MODERATOR');
	} else if (status === 'ready') {
		console.assert(user != null);
		if (user === null) {
			console.error('Invalid state');
			return null;
		}
		content = <Main
			user={user}
			isRefreshing={isRefreshing}
			moderatorRooms={moderatorRooms}
			childrenByRoom={childrenByRoom}
			knocksByRoom={knocksByRoom}
			acceptKnock={acceptKnock}
			rejectKnock={rejectKnock}
			removeChild={removeChild}
		/>;
	}

	return <Fragment>
		<header>
			<a href="/"><h1>udk/cms: {projectTitle}</h1></a>
		</header>
		<nav>
			{(status !== 'logged-out') && <div>
				<div>
					<a href="/" onClick={(event) => {
						event.preventDefault();
						logout();
					}}>
						/logout
					</a>
				</div>
				<div>
					<a href="/" onClick={refresh}>/refresh</a>
				</div>
			</div>}

			<LanguageSelector />
		</nav>

		<main>
			{content}
		</main>

		<footer>
			<p className="copyleft">
				🄯 2024 <a href="https://medienhaus.dev" rel="nofollow noopener noreferrer" target="_blank"><strong>medienhaus/</strong></a>
			</p>
		</footer>
	</Fragment>;
}

export default App;
