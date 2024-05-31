import { useTranslation } from 'react-i18next';

import { KnockEvent } from '../types';
import { formatDate } from '../utils/date';


interface KnockEventItemProps {
	data: KnockEvent,
	acceptKnock: (knock: KnockEvent) => Promise<void>,
	rejectKnock: (knock: KnockEvent) => Promise<void>,
}

const KnockEventItem = ({ data, acceptKnock, rejectKnock, }: KnockEventItemProps) => {
	const { t } = useTranslation();

	const userName = data.userDisplayName || '(UNKNOWN)';

	return <div className="KnockEventItem">
		<div className="metadata">
			<div><strong>{userName}</strong> {t('WANTS_TO_JOIN')}</div>
			<div>{formatDate(data.time)}</div>
			{data.reason && <div>{t('MESSAGE')}: {data.reason}</div>}
		</div>
		<div className="buttons">
			<button onClick={() => acceptKnock(data)}>{t('ACCEPT')}</button>
			<button onClick={() => rejectKnock(data)}>{t('REJECT')}</button>
		</div>
	</div>;
};

export default KnockEventItem;
