export function formatDate(d: Date) {
	return d.toISOString()
		.split('.')[0]
		.replace('T', ' ');
}
