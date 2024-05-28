import { Room } from 'matrix-js-sdk';
import { User } from '../types';


interface MainProps {
	user: User
	moderatorRooms: Room[]
}


function Main({ user, moderatorRooms }: MainProps) {
	return <div>
		<div>user: {user.displayName}</div>
		<div>id: {user.userId}</div>

		<p>Rooms in which you are a moderator:</p>
		{moderatorRooms.map((room) => {
			return <div key={room.roomId}>
				<h3>{room.name} ({room.roomId})</h3>
			</div>;
		})}
	</div>;
}

export default Main;
