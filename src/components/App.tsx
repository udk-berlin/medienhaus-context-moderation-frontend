import { Fragment, ReactNode, useState } from 'react';
import { ClientEvent, MatrixClient, MatrixError, Room } from 'matrix-js-sdk';

import Login from './Login';
import Main from './Main';

import { determineUserRooms, getKnockEvents } from '../utils/matrix';
import { AppStatus, KnockRequest, User } from '../types';
import { MSG_NOT_A_MODERATOR, projectTitle } from '../constants';
import { Loading } from './Loading';


interface AppProps {
	client: MatrixClient
}


function App({ client }: AppProps) {
	const [user, setUser] = useState<User | null>(null);
	const [loginErrors, setLoginErrors] = useState<string[]>([]);
	const [status, setStatus] = useState<AppStatus>('logged-out');
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [moderatorRooms, setModeratorRooms] = useState<Room[]>([]);
	const [knocksByRoom, setKnocksByRoom] = useState<Record<string, KnockRequest[]>>({});

	const updateEventsData = async (moderatorRooms: Room[]) => {
		setIsRefreshing(true);
		console.log('updating events data...');
		const knocksByRoom: Record<string, KnockRequest[]> = {};
		for (const room of moderatorRooms) {
			knocksByRoom[room.roomId] = await getKnockEvents(client, room.roomId);
		}
		setKnocksByRoom(knocksByRoom);
		setIsRefreshing(false);
	};

	const acceptKnock = async (knock: KnockRequest) => {
		await client.invite(knock.roomId, knock.userId);
		updateEventsData(moderatorRooms);
	};

	const rejectKnock = async (knock: KnockRequest) => {
		await client.kick(knock.roomId, knock.userId, /* 'Knock request denied.' */);
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

					// get public rooms
					const roomDirectory = (
						await client.publicRooms({ limit: 99999 })
					).chunk;
					const listedRoomsIds = roomDirectory.map((it) => it.room_id);

					// get rooms the user is a moderator of
					const rooms = client.getRooms();
					const moderatorRooms = await determineUserRooms(rooms, listedRoomsIds, user_id);
					setModeratorRooms(moderatorRooms);
					if (!moderatorRooms.length) {
						setStatus('not-a-moderator');
					} else {
						updateEventsData(moderatorRooms);
						setStatus('ready');
					}
				} else {
					console.error('Sync failed!');
				}
			});

			setStatus('initial-sync');
			/* await */ client.startClient();
		} catch (err) {
			if (err instanceof MatrixError) {
				console.error('Login failed:', err.data.error);
				setLoginErrors([err.data.error!]);
			}
			console.error(err);
		}
	};

	const logout: React.MouseEventHandler<HTMLElement> = (event) => {
		event.preventDefault();
		client.logout(true);
		setStatus('logged-out');
		setUser(null);
	};

	const refresh: React.MouseEventHandler<HTMLElement> = (event) => {
		event.preventDefault();
		updateEventsData(moderatorRooms);
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
			return console.error('Invalid state');
		}
		content = <Main
			user={user}
			isRefreshing={isRefreshing}
			moderatorRooms={moderatorRooms}
			knocksByRoom={knocksByRoom}
			acceptKnock={acceptKnock}
			rejectKnock={rejectKnock}
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
			{/* <select className="languageSelector">
				<option value="en" selected>EN</option>
				<option value="de">DE</option>
			</select> */}
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
