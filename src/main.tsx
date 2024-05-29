import React from 'react';
import ReactDOM from 'react-dom/client';
import * as sdk from 'matrix-js-sdk';

import App from './components/App.tsx';
import './index.css';


console.log('CONFIGURATION --------');
console.log(`Matrix server: ${import.meta.env.VITE_MATRIX_SERVER_URL}`);
console.log('----------------------');

const client = sdk.createClient({
	baseUrl: import.meta.env.VITE_MATRIX_SERVER_URL
});

ReactDOM.createRoot(document.getElementById('app')!).render(
	<React.StrictMode>
		<App client={client} />
	</React.StrictMode>,
);
