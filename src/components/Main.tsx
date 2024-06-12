import { Fragment, ReactNode } from 'react';
import { Room } from 'matrix-js-sdk';
import { useTranslation } from 'react-i18next';

import {
	ChildEvent,
	ChildRemovedEvent,
	ChildrenByRoom,
	KnockEvent,
	KnockRejectedEvent,
	KnocksByRoom,
	User
} from '../types';
import KnockEventItem from './KnockEventItem';
import { Loading } from './Loading';
import ChildEventItem from './ChildEventItem';
import ChildRemovedEventItem from './ChildEventRemovedItem';
import { groupChildEvents, groupKnockEvents } from '../utils';
import KnockRejectedEventItem from './KnockRejectedEventItem';


function Empty() {
	const { t } = useTranslation();
	return <span className="disabled">({t('NONE')})</span>;
}


interface CollapsibleProps {
	title: string
	count: number
	open: boolean
	children: ReactNode
}


function Collapsible({ title, open, count, children }: CollapsibleProps) {
	return <details open={open}>
		<summary>
			<h4>{title}: <span className="count">({count})</span></h4>
		</summary>
		{children}
	</details>;
}


interface PendingKnocksListProps {
	pendingKnocks: KnockEvent[]
	acceptKnock: (item: KnockEvent) => Promise<void>
	rejectKnock: (item: KnockEvent) => Promise<void>
}


function PendingKnocksList({ pendingKnocks, acceptKnock, rejectKnock }: PendingKnocksListProps) {
	return (!pendingKnocks.length)
		? <Empty />
		: <ul>
			{pendingKnocks.map((item) => {
				return <li key={item.userId}>
					<KnockEventItem
						data={item}
						acceptKnock={acceptKnock}
						rejectKnock={rejectKnock}
					/>
				</li>;
			})}
		</ul>;
}


interface RejectedKnocksListProps {
	rejectedKnocks: KnockRejectedEvent[]
}


function RejectedKnocksList({ rejectedKnocks }: RejectedKnocksListProps) {
	return (!rejectedKnocks.length)
		? <Empty />
		: <ul>
			{rejectedKnocks.map((item) => {
				return <li key={item.userId}>
					<KnockRejectedEventItem
						data={item}
					/>
				</li>;
			})}
		</ul>;
}


interface AddedChildrenListProps {
	addedChildren: ChildEvent[]
	removeChild: (item: ChildEvent) => Promise<void>,
}


function AddedChildrenList({ addedChildren, removeChild }: AddedChildrenListProps) {
	return (!addedChildren.length)
		? <Empty />
		: <ul>
			{addedChildren.map((item) => {
				return <li key={item.childRoomId}>
					<ChildEventItem
						data={item}
						removeChild={removeChild}
					/>
				</li>;
			})}
		</ul>;
}


interface RemovedChildrenListProps {
	removedChildren: ChildRemovedEvent[]
}


function RemovedChildrenList({ removedChildren }: RemovedChildrenListProps) {
	return (!removedChildren.length)
		? <Empty />
		: <ul>
			{removedChildren.map((item) => {
				return <li key={item.childRoomId}>
					<ChildRemovedEventItem
						data={item}
					/>
				</li>;
			})}
		</ul>;
}


interface MainProps {
	user: User,
	isRefreshing: boolean,
	moderatorRooms: Room[],
	childrenByRoom: ChildrenByRoom,
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

		{(isRefreshing) ? <Fragment>
			<br />
			<Loading />
		</Fragment> : moderatorRooms.map((room) => {
			const { pendingKnocks, rejectedKnocks } = groupKnockEvents(knocksByRoom[room.roomId] || []);
			const { addedChildren, removedChildren } = groupChildEvents(childrenByRoom[room.roomId] || []);

			return <section className="section" key={room.roomId}>
				<h3>{room.name}</h3>

				<Collapsible
					title={t('USERS_WANTING_TO_JOIN')}
					count={pendingKnocks.length}
					open={pendingKnocks.length > 0}
				>
					<PendingKnocksList
						pendingKnocks={pendingKnocks}
						acceptKnock={acceptKnock}
						rejectKnock={rejectKnock}
					/>
				</Collapsible>

				<Collapsible
					title={t('REJECTED_USERS')}
					count={rejectedKnocks.length}
					open={false}
				>
					<RejectedKnocksList
						rejectedKnocks={rejectedKnocks}
					/>
				</Collapsible>

				<Collapsible
					title={t('CONNECTED_ROOMS')}
					count={addedChildren.length}
					open={addedChildren.length > 0}
				>
					<AddedChildrenList
						addedChildren={addedChildren}
						removeChild={removeChild}
					/>
				</Collapsible>

				<Collapsible
					title={t('REMOVED_ROOMS')}
					count={removedChildren.length}
					open={false}
				>
					<RemovedChildrenList
						removedChildren={removedChildren}
					/>
				</Collapsible>
			</section>;
		})}
	</Fragment >;
}

export default Main;
