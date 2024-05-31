import { useTranslation, Trans } from 'react-i18next';

import { ChildEvent } from '../types';
import { formatDate } from '../utils/date';


interface ChildEventItemProps {
	data: ChildEvent,
	removeChild: (item: ChildEvent) => Promise<void>,
}

const ChildEventItem = ({ data, removeChild }: ChildEventItemProps) => {
	const { t } = useTranslation();
	const roomName = data.childRoomName || '(UNKNOWN)';

	return <div className="ChildEventItem">
		<div className="metadata">
			<div>
				<Trans
					i18nKey="USER_ADDED_ROOM"
					values={{ user: data.userDisplayName, room: roomName }}
				/>
			</div>
			<div>{formatDate(data.time)}</div>
		</div>
		<div className="buttons">
			<button onClick={() => removeChild(data)}>
				{t('REMOVE')}
			</button>
		</div>
	</div>;
};

export default ChildEventItem;
