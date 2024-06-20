import { Trans } from 'react-i18next';

import { ChildRemovedEvent } from '../types';
import { formatDate } from '../utils/date';


interface ChildRemovedEventItemProps {
	data: ChildRemovedEvent,
}

const ChildRemovedEventItem = ({ data }: ChildRemovedEventItemProps) => {
	return <div className="ChildRemovedEventItem">
		<div className="metadata">
			<div>
				<Trans
					i18nKey="ROOM_REMOVED_BY"
					values={{
						user: data.userDisplayName,
						room: data.childRoomName,
						by: data.removedByUserName
					}}
				/>
			</div>
			<div>{formatDate(data.time)}</div>
		</div>
		{/* <div className="buttons">
			<button onClick={() => removeChild(data)}>
				{t('REMOVE')}
			</button>
		</div> */}
	</div>;
};

export default ChildRemovedEventItem;
