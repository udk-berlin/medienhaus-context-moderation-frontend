import { User } from '../types';


interface MainProps {
	user: User
}


function Main({ user }: MainProps) {
	return <div>
		<div>main view</div>
		<div>user: {user.displayName}</div>
		<div>id: {user.userId}</div>
	</div>;
}

export default Main;
