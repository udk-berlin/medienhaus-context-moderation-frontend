import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App.tsx';
import './index.css';

console.log('CONFIGURATION --------');
console.log(`Matrix server: ${import.meta.env.VITE_MATRIX_SERVER_URL}`);
console.log('----------------------');

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
