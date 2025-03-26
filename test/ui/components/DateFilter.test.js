import { fireEvent, getByText, screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

const mockSlotService = {
  updateDateRange: jest.fn(),
  getLastUpdate: jest.fn().mockResolvedValue(new Date()),
  filterSlots: jest.fn(),
  setSlotUpdateCallback: jest.fn(),
  formatDate: jest.fn(date => `${date} (formaté)`)
};

jest.mock('../../../public/js/services/SlotService.js', () => ({
  default: class {
    constructor() {
      return mockSlotService;
    }
  }
}));

describe('DateFilter', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        <div id="date-filter">
          <input type="date" id="startDate">
          <input type="date" id="endDate">
        </div>
      </div>
    `;

    // Import et initialisation du composant
    const DateFilter = require('../../../public/js/ui/DateFilter.js').default;
    const dateFilter = new DateFilter(mockSlotService);
  });

  afterEach(() => {
    jest.resetModules();
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('should call updateDateRange when dates change', () => {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    // Simuler la sélection des dates
    fireEvent.change(startDateInput, { target: { value: '2025-03-26' } });
    fireEvent.change(endDateInput, { target: { value: '2025-03-27' } });

    // Vérifier que updateDateRange est appelé avec les bonnes dates
    expect(mockSlotService.updateDateRange).toHaveBeenCalledWith('2025-03-26', '2025-03-27');
  });

  test('should adjust end date if before start date', () => {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    // Simuler une plage de dates invalide
    fireEvent.change(startDateInput, { target: { value: '2025-03-27' } });
    fireEvent.change(endDateInput, { target: { value: '2025-03-26' } });

    // Vérifier que la date de fin est ajustée
    expect(endDateInput.value).toBe('2025-03-27');
    expect(mockSlotService.updateDateRange).toHaveBeenCalledWith('2025-03-27', '2025-03-27');
  });

  test('should return current date range', () => {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    // Simuler la sélection des dates
    fireEvent.change(startDateInput, { target: { value: '2025-03-26' } });
    fireEvent.change(endDateInput, { target: { value: '2025-03-27' } });

    // Import pour accéder à l'instance
    const DateFilter = require('../../../public/js/ui/DateFilter.js').default;
    const dateFilter = new DateFilter(mockSlotService);

    // Vérifier que getDateRange retourne les bonnes dates
    const { startDate, endDate } = dateFilter.getDateRange();
    expect(startDate).toBe('2025-03-26');
    expect(endDate).toBe('2025-03-27');
  });
});
