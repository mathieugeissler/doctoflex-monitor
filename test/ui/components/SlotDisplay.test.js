import { fireEvent, getByText, screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

const mockSlotService = {
  initialize: jest.fn(),
  filterSlots: jest.fn(),
  setSlotUpdateCallback: jest.fn(),
  formatDate: jest.fn(date => `${date} (formaté)`),
  getLastUpdate: jest.fn().mockResolvedValue(new Date())
};

jest.mock('../../../public/js/services/SlotService.js', () => ({
  default: class {
    constructor() {
      return mockSlotService;
    }
  }
}));

describe('SlotDisplay', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        <div id="slots-container"></div>
      </div>
    `;

    // Import et initialisation du composant
    const SlotDisplay = require('../../../public/js/ui/SlotDisplay.js').default;
    const slotDisplay = new SlotDisplay(mockSlotService);
  });

  afterEach(() => {
    jest.resetModules();
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('should group and display slots by date', async () => {
    const slots = [
      { date: '2025-03-26', time: '14:00', bookingUrl: 'http://example.com/1' },
      { date: '2025-03-26', time: '15:00', bookingUrl: 'http://example.com/2' },
      { date: '2025-03-27', time: '10:00', bookingUrl: 'http://example.com/3' }
    ];

    // Simuler l'affichage des créneaux
    const slotDisplay = new (require('../../../public/js/ui/SlotDisplay.js').default)(mockSlotService);
    await slotDisplay.displaySlots(slots);

    // Vérifier l'affichage
    const slotsContainer = document.getElementById('slots-container');
    const dateCards = slotsContainer.querySelectorAll('.bg-white.rounded-lg');
    expect(dateCards).toHaveLength(2);

    // Vérifier la première carte (26 mars)
    const firstCard = dateCards[0];
    expect(firstCard.querySelector('h3')).toHaveTextContent('2025-03-26 (formaté)');
    expect(firstCard.querySelector('.text-gray-500')).toHaveTextContent('2 créneaux');
    const firstCardChips = firstCard.querySelectorAll('button');
    expect(firstCardChips).toHaveLength(2);
    expect(firstCardChips[0]).toHaveTextContent('14:00');
    expect(firstCardChips[1]).toHaveTextContent('15:00');

    // Vérifier la deuxième carte (27 mars)
    const secondCard = dateCards[1];
    expect(secondCard.querySelector('h3')).toHaveTextContent('2025-03-27 (formaté)');
    expect(secondCard.querySelector('.text-gray-500')).toHaveTextContent('1 créneau');
    const secondCardChips = secondCard.querySelectorAll('button');
    expect(secondCardChips).toHaveLength(1);
    expect(secondCardChips[0]).toHaveTextContent('10:00');
  });

  test('should show no slots message when empty', async () => {
    // Simuler l'affichage sans créneaux
    const slotDisplay = new (require('../../../public/js/ui/SlotDisplay.js').default)(mockSlotService);
    await slotDisplay.displaySlots([]);

    // Vérifier le message
    const slotsContainer = document.getElementById('slots-container');
    const message = slotsContainer.querySelector('.text-gray-500');
    expect(message).toHaveTextContent('Aucun créneau disponible');
  });

  test('should open booking URL when clicking on slot', async () => {
    const slots = [
      { date: '2025-03-26', time: '14:00', bookingUrl: 'http://example.com/1' }
    ];

    // Mock window.open
    const mockOpen = jest.fn();
    window.open = mockOpen;

    // Simuler l'affichage et le clic
    const slotDisplay = new (require('../../../public/js/ui/SlotDisplay.js').default)(mockSlotService);
    await slotDisplay.displaySlots(slots);

    const timeChip = document.querySelector('button');
    fireEvent.click(timeChip);

    // Vérifier que le lien s'ouvre dans un nouvel onglet
    expect(mockOpen).toHaveBeenCalledWith('http://example.com/1', '_blank');
  });

  test('should clear slots container', async () => {
    const slots = [
      { date: '2025-03-26', time: '14:00', bookingUrl: 'http://example.com/1' }
    ];

    // Simuler l'affichage puis le nettoyage
    const slotDisplay = new (require('../../../public/js/ui/SlotDisplay.js').default)(mockSlotService);
    await slotDisplay.displaySlots(slots);
    expect(document.getElementById('slots-container').innerHTML).not.toBe('');

    slotDisplay.clear();
    expect(document.getElementById('slots-container').innerHTML).toBe('');
  });
});
