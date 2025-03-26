const notificationService = require('./notification');

class SlotNotifier {
    async notify(slots) {
        if (!slots || slots.length === 0) {
            return;
        }

        const message = this.formatMessage(slots);
        await notificationService.sendNotification(message);
    }

    formatMessage(slots) {
        const slotsText = slots.map(slot => 
            `- ${slot.date} à ${slot.time}`
        ).join('\n');

        return `Nouveaux créneaux disponibles :\n${slotsText}`;
    }
}

module.exports = SlotNotifier;
