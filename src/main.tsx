import React from 'react';
import ReactDOM from 'react-dom/client';
import * as sdk from 'matrix-js-sdk';

import App from './components/App.tsx';
import { init as initI18n } from './i18n.ts';
import './index.css';


console.log('CONFIGURATION --------');
console.log(`Matrix server: ${import.meta.env.VITE_MATRIX_SERVER_URL}`);
console.log('----------------------');

const client = sdk.createClient({
	baseUrl: import.meta.env.VITE_MATRIX_SERVER_URL
});

initI18n();

ReactDOM.createRoot(document.getElementById('app')!).render(
	<React.StrictMode>
		<App client={client} />
	</React.StrictMode>,
);
