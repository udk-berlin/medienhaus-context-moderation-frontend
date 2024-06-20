import React from 'react';
import ReactDOM from 'react-dom/client';
import * as sdk from 'matrix-js-sdk';

import App from './components/App.tsx';
import { init as initI18n } from './i18n.ts';
import './index.css';


console.log('CONFIGURATION --------');
console.log(`App name: ${import.meta.env.VITE_APP_NAME}`);
console.log(`Page title: ${import.meta.env.VITE_HTML_TITLE}`);
console.log(`Matrix server: ${import.meta.env.VITE_MATRIX_SERVER_URL}`);
console.log(`Max room age: ${import.meta.env.VITE_MAX_ROOM_AGE_DAYS}`);
console.log('----------------------');

document.title = import.meta.env.VITE_HTML_TITLE;

const client = sdk.createClient({
	baseUrl: import.meta.env.VITE_MATRIX_SERVER_URL
});

initI18n();

ReactDOM.createRoot(document.getElementById('app')!).render(
	<React.StrictMode>
		<App client={client} />
	</React.StrictMode>,
);
