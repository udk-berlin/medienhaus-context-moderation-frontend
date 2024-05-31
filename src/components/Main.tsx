import { Fragment } from 'react';
import { Room } from 'matrix-js-sdk';

import { ChildEvent, KnockEvent, User } from '../types';
import { projectTitle } from '../constants';
import KnockEventItem from './KnockEventItem';
import { Loading } from './Loading';
import ChildEventItem from './ChildEventItem';


interface MainProps {
	user: User,
	isRefreshing: boolean,
	moderatorRooms: Room[],
	childrenByRoom: Record<string, ChildEvent[]>,
	knocksByRoom: Record<string, KnockEvent[]>,
	acceptKnock: (item: KnockEvent) => Promise<void>,
	rejectKnock: (item: KnockEvent) => Promise<void>,
	removeChild: (item: ChildEvent) => Promise<void>,
}


function Main({
	user,
	moderatorRooms,
	childrenByRoom,
	knocksByRoom,
	acceptKnock,
	rejectKnock,
	removeChild,
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
				const children = childrenByRoom[room.roomId] || [];

				return <div key={room.roomId}>
					<h3>{room.name}</h3>

					<h4>Knocks:</h4>
					{(!knocks.length)
						? <span className="disabled">(No action required)</span>
						: <ul>
							{knocks.map((item) => {
								return <li key={item.userId}>
									<KnockEventItem
										data={item}
										acceptKnock={acceptKnock}
										rejectKnock={rejectKnock}
									/>
								</li>;
							})}
						</ul>
					}

					<h4>Children:</h4>
					{(!children.length)
						? <span className="disabled">(No children)</span>
						: <ul>
							{children.map((item) => {
								return <li key={item.childRoomId}>
									<ChildEventItem
										data={item}
										removeChild={removeChild}
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
