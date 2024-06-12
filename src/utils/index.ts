import { ChildEvent, ChildRemovedEvent, KnockEvent, KnockRejectedEvent } from '../types';

export function groupKnockEvents(knocks: (KnockEvent | KnockRejectedEvent)[]) {
	const pendingKnocks: KnockEvent[] = [];
	const rejectedKnocks: KnockRejectedEvent[] = [];
	knocks.forEach((knock) => {
		if ('rejectedByUserId' in knock) {
			rejectedKnocks.push(knock);
		} else {
			pendingKnocks.push(knock);
		}
	});
	return {
		pendingKnocks,
		rejectedKnocks
	};
}


export function groupChildEvents(children: (ChildEvent | ChildRemovedEvent)[]) {
	const addedChildren: ChildEvent[] = [];
	const removedChildren: ChildRemovedEvent[] = [];
	children.forEach((item) => {
		if ('removedByUserName' in item) {
			removedChildren.push(item);
		} else {
			addedChildren.push(item);
		}
	});
	return {
		addedChildren,
		removedChildren
	};
}
