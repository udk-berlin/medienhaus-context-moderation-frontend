import { Trans } from 'react-i18next';

import { KnockRejectedEvent } from '../types';
import { formatDate } from '../utils/date';


interface KnockRejectedEventItemProps {
	data: KnockRejectedEvent,
}

const KnockRejectedEventItem = ({ data }: KnockRejectedEventItemProps) => {
	return <div className="KnockRejectedEventItem">
		<div className="metadata">
			<div>
				<Trans
					i18nKey="USER_KNOCK_REJECTED"
					values={{ user: data.userDisplayName, by: data.rejectedByUserName }}
				/>
			</div>
			<div>{formatDate(data.time)}</div>
		</div>
		{/* <div className="buttons">
			<button onClick={() => acceptKnock(data)}>{t('ACCEPT')}</button>
			<button onClick={() => rejectKnock(data)}>{t('REJECT')}</button>
		</div> */}
	</div>;
};

export default KnockRejectedEventItem;
