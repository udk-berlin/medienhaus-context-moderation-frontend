import { Fragment, ReactNode, useEffect, useState } from 'react';
import * as sdk from 'matrix-js-sdk';
import { ClientEvent, MatrixClient, MatrixError, Room } from 'matrix-js-sdk';

import Login from './Login';
import Main from './Main';

import { determineUserRooms } from '../utils/matrix';
import { AppStatus, User } from '../types';


function initClient(baseUrl: string) {
	return sdk.createClient({ baseUrl });
}


function App() {
	const [client, setClient] = useState<MatrixClient | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [loginErrors, setLoginErrors] = useState<string[]>([]);
	const [status, setStatus] = useState<AppStatus>('logged-out');
	const [moderatorRooms, setModeratorRooms] = useState<Room[]>([]);

	useEffect(
		() => {
			if (status === 'logged-out') {
				setUser(null);
			}
		},
		[status]
	);

	useEffect(
		() => setClient(
			initClient(import.meta.env.VITE_MATRIX_SERVER_URL)
		),
		[]
	);

	const onLoginSubmit = async (user: string, password: string) => {
		console.assert(client != null);
		if (client == null) { return; }

		setLoginErrors([]);

		try {
			const res = await client.loginWithPassword(user, password);
			const { access_token, user_id } = res;
			client.setAccessToken(access_token);
			setStatus('logged-in');

			client.once(ClientEvent.Sync, async (state: string/* , prevState, res */) => {
				if (state === 'PREPARED') {
					console.log('Sync complete');

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

					const rooms = client.getRooms();
					const moderatorRooms = await determineUserRooms(rooms, listedRoomsIds, user_id);
					setModeratorRooms(moderatorRooms);

					setStatus('ready');
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

	const onLogOut = () => {
		client!.logout(true);
		setStatus('logged-out');
	};

	let content: ReactNode = null;
	if (!client) {
		// content = 'Initializing ...';
	} else {
		if (status === 'logged-out') {
			content = <Login
				onSubmit={onLoginSubmit}
				errors={loginErrors}
			/>;
		} else if (status === 'initial-sync') {
			content = 'Syncing...'; // TODO: show spinner
		} else if (status === 'ready') {
			console.assert(user != null);
			if (user === null) {
				console.error('Invalid state');
				return;
			}
			content = <Fragment>
				<button onClick={onLogOut}>Logout</button>
				<Main
					user={user}
					moderatorRooms={moderatorRooms}
				/>
			</Fragment>;
		}
	}

	return <Fragment>
		<h1>Moderator quick actions</h1>
		<main>{content}</main>
	</Fragment>;
}

export default App;
