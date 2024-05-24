import { Fragment, useEffect, useState } from 'react';
import * as sdk from 'matrix-js-sdk';
import { MatrixClient, MatrixError } from 'matrix-js-sdk';

import Login from './Login';
import Main from './Main';

import { User } from '../types';


function initClient(baseUrl: string) {
	return sdk.createClient({ baseUrl });
}


function App() {
	const [client, setClient] = useState<MatrixClient | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [loginErrors, setLoginErrors] = useState<string[]>([]);

	useEffect(
		() => {
			setClient(
				initClient(import.meta.env.VITE_MATRIX_SERVER_URL)
			);
		},
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

			client.startClient();

			const { displayname } = await client.getProfileInfo(user_id);

			setUser({
				userId: user_id,
				displayName: displayname
			});
		} catch (err) {
			if (err instanceof MatrixError) {
				console.error('Login failed:', err.data.error);
				setLoginErrors([err.data.error!]);
			}
			console.error(err);
		}
	};

	return <Fragment>
		<h1>email notification system: frontend</h1>
		<div>{
			(!client)
				? 'Initializing ...'
				: (!user)
					? <Login
						onSubmit={onLoginSubmit}
						errors={loginErrors}
					/>
					: <Main
						user={user}
					/>
		}</div>
	</Fragment>;
}

export default App;
