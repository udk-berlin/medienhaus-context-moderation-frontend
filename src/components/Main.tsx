import { Room } from 'matrix-js-sdk';
import { KnockRequest, User } from '../types';


interface MainProps {
	user: User
	moderatorRooms: Room[],
	knocksByRoom: Record<string, KnockRequest[]>,
}


function Main({ user, moderatorRooms, knocksByRoom }: MainProps) {
	return <div>
		<div>user: {user.displayName}</div>
		<div>id: {user.userId}</div>

		<p>Rooms in which you are a moderator:</p>
		{moderatorRooms.map((room) => {
			const knocks = knocksByRoom[room.roomId] || [];
			return <div key={room.roomId}>
				<h3>{room.name}</h3>
				<ul>
					{knocks.map((knock) => {
						return <li key={knock.userId}>
							<strong>{knock.userDisplayName}</strong>
							<span> knocked</span>
							<ul>
								<li>Id: {knock.userId}</li>
								<li>Time: {knock.time.toISOString()}</li>
								<li>Message: {knock.reason || ''}</li>
							</ul>
						</li>;
					})}
				</ul>
			</div>;
		})}
	</div>;
}

export default Main;
