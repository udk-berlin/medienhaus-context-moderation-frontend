import { Fragment } from 'react';
import { Room } from 'matrix-js-sdk';

import { KnockRequest, User } from '../types';
import { projectTitle } from '../constants';
import KnockEventItem from './KnockEventItem';
import { Loading } from './Loading';


interface MainProps {
	user: User,
	isRefreshing: boolean,
	moderatorRooms: Room[],
	knocksByRoom: Record<string, KnockRequest[]>,
	acceptKnock: (knock: KnockRequest) => Promise<void>,
	rejectKnock: (knock: KnockRequest) => Promise<void>,
}


function Main({
	user,
	moderatorRooms,
	knocksByRoom,
	acceptKnock,
	rejectKnock,
	isRefreshing,
}: MainProps) {
	return <Fragment>
		<section className="landing">
			<p>Hello <strong>{user.displayName}</strong>.</p>
			<h2>Welcome to the udk/{projectTitle}!</h2>
		</section>

		<section>
			<p>Rooms in which you are a moderator:</p>
			{(isRefreshing) ? <Loading /> : moderatorRooms.map((room) => {
				const knocks = knocksByRoom[room.roomId] || [];
				return <div key={room.roomId}>
					<h3>{room.name}</h3>
					{(!knocks.length)
						? <span className="disabled">(No action required)</span>
						: <ul>
							{knocks.map((knock) => {
								return <li key={knock.userId}>
									<KnockEventItem
										data={knock}
										acceptKnock={acceptKnock}
										rejectKnock={rejectKnock}
									/>
								</li>;
							})}
						</ul>
					}
				</div>;
			})}
		</section>
	</Fragment>;
}

export default Main;
