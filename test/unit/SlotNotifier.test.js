const SlotNotifier = require('../../src/services/SlotNotifier');

jest.mock('@slack/webhook', () => ({
    IncomingWebhook: jest.fn().mockImplementation(() => ({
        send: jest.fn().mockResolvedValue(true)
    }))
}));

describe('SlotNotifier', () => {
    let notifier;
    const webhookUrl = 'https://hooks.slack.com/services/test';

    beforeEach(() => {
        notifier = new SlotNotifier(webhookUrl);
    });

    test('should not send notification for empty slots', async () => {
        await notifier.notify([]);
        expect(notifier.webhook.send).not.toHaveBeenCalled();
    });

    test('should format and send notification for new slots', async () => {
        const slots = [
            { date: '07/04/2025', time: '15:30' },
            { date: '23/04/2025', time: '12:30' }
        ];

        await notifier.notify(slots);

        expect(notifier.webhook.send).toHaveBeenCalledWith({
            text: '*Nouveaux créneaux disponibles :*\n- 07/04/2025 à 15:30\n- 23/04/2025 à 12:30'
        });
    });
});
