import { ChildEvent } from '../types';
import { formatDate } from '../utils/date';

interface ChildEventItemProps {
	data: ChildEvent,
	removeChild: (item: ChildEvent) => Promise<void>,
}

const ChildEventItem = ({ data, removeChild }: ChildEventItemProps) => {
	return <div className="ChildEventItem">
		<div className="metadata">
			<div>
				<strong>{data.userDisplayName}</strong> added
				room <strong>{data.childRoomName || <span className="disabled">(UNKNOWN)</span>}</strong>
			</div>
			<div>{formatDate(data.time)}</div>
		</div>
		<div className="buttons">
			<button onClick={() => removeChild(data)}>remove</button>
		</div>
	</div>;
};

export default ChildEventItem;
