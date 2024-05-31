/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Fragment, ReactNode, useState } from 'react';
import { ClientEvent, MatrixClient, MatrixError, Room, RoomStateEvent } from 'matrix-js-sdk';

import Login from './Login';
import Main from './Main';
import { Loading } from './Loading';

import { determineUserRooms, getChildEvents, getKnockEvents, getPublicRooms } from '../utils/matrix';
import { AppStatus, ChildEvent, KnockEvent, User } from '../types';
import { MSG_NOT_A_MODERATOR, projectTitle, roomsToIgnore } from '../constants';
import LanguageSelector from './LanguageSelector';


interface AppProps {
	client: MatrixClient
}


function App({ client }: AppProps): ReactNode {
	const [user, setUser] = useState<User | null>(null);
	const [loginErrors, setLoginErrors] = useState<string[]>([]);
	const [status, setStatus] = useState<AppStatus>('logged-out');
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [moderatorRooms, setModeratorRooms] = useState<Room[]>([]);
	const [knocksByRoom, setKnocksByRoom] = useState<Record<string, KnockEvent[]>>({});
	const [childrenByRoom, setChildrenByRoom] = useState<Record<string, ChildEvent[]>>({});

	const updateModeratorRooms = async () => {
		console.info('Updating rooms data...');

		const userId = client.getUserId();
		console.assert(userId !== null);
		if (userId === null) {
			console.log('Failed to get user id. This should not happen.');
			return [];
		}

		setIsRefreshing(true);

		// get public rooms
		const roomDirectory = await getPublicRooms(client);
		const listedRoomsIds = roomDirectory.map((it) => it.room_id);

		// get rooms the user is a moderator of
		const rooms = client.getRooms()
			// it doesn't make sense to show certain rooms, so we remove them
			.filter((room) => !roomsToIgnore.includes(room.name));
		const moderatorRooms = await determineUserRooms(rooms, listedRoomsIds, userId);
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

		setIsRefreshing(true); // TODO: keep?

		const knocksByRoom: Record<string, KnockEvent[]> = {};
		const childrenByRoom: Record<string, ChildEvent[]> = {};
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
				// @ts-expect-error
				'm.space.child',
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
			const res = await client.loginWithPassword(user, password);
			const { access_token, user_id } = res;
			client.setAccessToken(access_token);
			setStatus('logged-in');

			client.once(ClientEvent.Sync, async (state: string) => {
				if (state === 'PREPARED') {
					console.log('Sync complete');

					// set user info
					const { displayname } = await client.getProfileInfo(user_id);
					setUser({
						userId: user_id,
						displayName: displayname
					});

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
		} catch (err) {
			if (err instanceof MatrixError) {
				console.error('Login failed:', err.data.error);
				setLoginErrors([err.data.error!]);
			}
			console.error(err);
		}
	};

	const logout: React.MouseEventHandler<HTMLElement> = async (event) => {
		event.preventDefault();
		setStatus('logged-out');
		setUser(null);
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
		content = MSG_NOT_A_MODERATOR;
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
			<a href="/"><h1>udk/{projectTitle}</h1></a>
		</header>
		<nav>
			{(status !== 'logged-out') && <div>
				<div>
					<a href="/" onClick={logout}>/logout</a>
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
