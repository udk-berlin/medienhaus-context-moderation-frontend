import { useTranslation } from 'react-i18next';

import { KnockRejectedEvent } from '../types';
import { formatDate } from '../utils/date';


interface KnockRejectedEventItemProps {
	data: KnockRejectedEvent,
}

const KnockRejectedEventItem = ({ data }: KnockRejectedEventItemProps) => {
	const { t } = useTranslation();

	return <div className="KnockRejectedEventItem">
		<div className="metadata">
			<div>REJECTED</div>
			<div>{formatDate(data.time)}</div>
		</div>
		{/* <div className="buttons">
			<button onClick={() => acceptKnock(data)}>{t('ACCEPT')}</button>
			<button onClick={() => rejectKnock(data)}>{t('REJECT')}</button>
		</div> */}
	</div>;
};

export default KnockRejectedEventItem;
