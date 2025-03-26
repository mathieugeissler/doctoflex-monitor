export function formatDate(dateStr) {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(year, month - 1, day);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('fr-FR', options);
}

export function formatTimeRange(times) {
    if (times.length === 1) {
        return times[0];
    }
    return `${times[0]} - ${times[times.length - 1]}`;
}

export function groupConsecutiveTimes(times) {
    times.sort();
    const groups = [];
    let currentGroup = [times[0]];

    for (let i = 1; i < times.length; i++) {
        const currentTime = times[i];
        const lastTime = currentGroup[currentGroup.length - 1];
        
        const [lastHour, lastMin] = lastTime.split(':').map(Number);
        const [currentHour, currentMin] = currentTime.split(':').map(Number);
        const lastTotalMinutes = lastHour * 60 + lastMin;
        const currentTotalMinutes = currentHour * 60 + currentMin;

        if (currentTotalMinutes - lastTotalMinutes === 30) {
            currentGroup.push(currentTime);
        } else {
            groups.push([...currentGroup]);
            currentGroup = [currentTime];
        }
    }
    groups.push(currentGroup);
    return groups;
}
