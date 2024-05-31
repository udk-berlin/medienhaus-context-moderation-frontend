import { Fragment, ReactNode } from 'react';
import { Room } from 'matrix-js-sdk';
import { useTranslation } from 'react-i18next';

import { ChildEvent, KnockEvent, KnocksByRoom, User } from '../types';
import KnockEventItem from './KnockEventItem';
import { Loading } from './Loading';
import ChildEventItem from './ChildEventItem';
import KnockRejectedEventItem from './KnockRejectedEventItem';


interface MainProps {
	user: User,
	isRefreshing: boolean,
	moderatorRooms: Room[],
	childrenByRoom: Record<string, ChildEvent[]>,
	knocksByRoom: KnocksByRoom,
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
	const { t } = useTranslation();

	return <Fragment>
		<section className="landing">
			<p>{t('HELLO')} <strong>{user.displayName}</strong>.</p>
			{/* <h2>{t('WELCOME_MSG')}</h2> */}
			<br />
			{t('SPACES_YOU_ARE_MOD_OF')}:
		</section>

		{(isRefreshing) ? <Loading /> : moderatorRooms.map((room) => {
			const knocks = knocksByRoom[room.roomId] || [];
			const children = childrenByRoom[room.roomId] || [];

			return <section className="section" key={room.roomId}>
				<h3>{room.name}</h3>
				<h4>{t('USERS_WANTING_TO_JOIN')}:</h4>
				{(!knocks.length)
					? <span className="disabled">({t('EMPTY')})</span>
					: <ul>
						{knocks.map((item) => {
							let content: ReactNode = null;
							if ('rejectedByUserId' in item) {
								content = <KnockRejectedEventItem
									data={item}
								/>;
							} else {
								content = <KnockEventItem
									data={item}
									acceptKnock={acceptKnock}
									rejectKnock={rejectKnock}
								/>;
							}
							return <li key={item.userId}>
								{content}
							</li>;
						})}
					</ul>
				}
				<h4>{t('CONNECTED_ROOMS')}:</h4>
				{(!children.length)
					? <span className="disabled">({t('EMPTY')})</span>
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
			</section>;
		})}
	</Fragment>;
}

export default Main;
