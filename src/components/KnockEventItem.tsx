import { KnockRequest } from '../types';
import { formatDate } from '../utils/date';

interface KnockEventItemProps {
	data: KnockRequest,
	acceptKnock: (knock: KnockRequest) => Promise<void>,
	rejectKnock: (knock: KnockRequest) => Promise<void>,
}

const KnockEventItem = ({ data, acceptKnock, rejectKnock, }: KnockEventItemProps) => {
	return <div className="KnockEventItem">
		<div className="metadata">
			<div><strong>{data.userDisplayName}</strong> knocked</div>
			<div>{formatDate(data.time)}</div>
			<div>Message: {data.reason || <span className="disabled">(none)</span>}</div>
		</div>
		<div className="buttons">
			<button onClick={() => acceptKnock(data)}>accept</button>
			<button onClick={() => rejectKnock(data)}>reject</button>
		</div>
	</div>;
};

export default KnockEventItem;
