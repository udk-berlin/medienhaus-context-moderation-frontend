export function formatDate(d: Date) {
	return d.toISOString()
		.split('.')[0]
		.replace('T', ' ');
}


export function getDifferenceInDays(ts1: number, ts2: number) {
	const diffInMs = Math.abs(ts2 - ts1);
	const msInADay = 24 * 60 * 60 * 1000;
	const diffInDays = diffInMs / msInADay;
	return diffInDays;
}
