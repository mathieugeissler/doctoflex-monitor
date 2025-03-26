import { fireEvent, getByText, screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Mock des services
const mockSocketService = {
  on: jest.fn(),
  emit: jest.fn(),
  initialize: jest.fn().mockResolvedValue(undefined),
  removeAllListeners: jest.fn()
};

jest.mock('../../../public/js/services/SocketService.js', () => ({
  default: class {
    static instance = null;
    static getInstance() {
      if (!this.instance) {
        this.instance = mockSocketService;
      }
      return this.instance;
    }
  }
}));

// Mock de la classe Notification
global.Notification = class {
  static permission = 'default';
  static async requestPermission() {
    return 'granted';
  }
  constructor(title, options) {
    this.title = title;
    this.options = options;
    this.onclick = null;
  }
  close() {}
};

const mockNotificationService = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  requestPermission: jest.fn().mockResolvedValue(true)
};

jest.mock('../../../public/js/services/NotificationService.js', () => ({
  default: class {
    static requestPermission = mockNotificationService.requestPermission;
    static success = mockNotificationService.success;
    static error = mockNotificationService.error;
    static info = mockNotificationService.info;
  }
}));

const mockPreferencesService = {
  getPreferences: jest.fn().mockReturnValue({ browser: false, sound: false }),
  updatePreferences: jest.fn()
};

jest.mock('../../../public/js/services/PreferencesService.js', () => ({
  default: class {
    static instance = null;
    static getInstance() {
      if (!this.instance) {
        this.instance = mockPreferencesService;
      }
      return this.instance;
    }
  }
}));

describe('SettingsModal', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        <button id="open-settings">Paramètres</button>
        <div id="settings-modal" class="hidden">
          <button id="close-settings">Fermer</button>
          <input type="number" id="interval" min="1" value="1">
          <input type="checkbox" id="browser-notifications">
          <input type="checkbox" id="sound-notifications">
          <input type="date" id="start-date">
          <input type="date" id="end-date">
        </div>
      </div>
    `;

    // Import et initialisation du composant
    const SettingsModal = require('../../../public/js/ui/SettingsModal.js').default;
    const settingsModal = new SettingsModal(mockSocketService, mockNotificationService, mockPreferencesService);
  });

  afterEach(() => {
    jest.resetModules();
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('should open and close modal', () => {
    const modal = document.getElementById('settings-modal');
    const openButton = document.getElementById('open-settings');
    const closeButton = document.getElementById('close-settings');

    // Vérifier que le modal est initialement caché
    expect(modal).toHaveClass('hidden');

    // Ouvrir le modal
    fireEvent.click(openButton);
    expect(modal).not.toHaveClass('hidden');

    // Fermer avec le bouton fermer
    fireEvent.click(closeButton);
    expect(modal).toHaveClass('hidden');
  });

  test('should save settings when interval changes', async () => {
    const openButton = document.getElementById('open-settings');
    const intervalInput = document.getElementById('interval');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    // Ouvrir le modal
    fireEvent.click(openButton);

    // Simuler la saisie de l'utilisateur
    intervalInput.value = '5';
    fireEvent.input(intervalInput);

    // Simuler les dates
    startDateInput.value = '2025-03-27';
    endDateInput.value = '2025-04-03';
    fireEvent.input(startDateInput);
    fireEvent.input(endDateInput);

    // Vérifier que les paramètres sont mis à jour
    await new Promise(resolve => setTimeout(resolve, 600));
    expect(mockSocketService.emit).toHaveBeenCalledWith('config:update', {
      monitoringInterval: 5,
      dateRange: {
        startDate: expect.any(Date),
        endDate: expect.any(Date)
      }
    });
  });

  test('should handle browser notification changes', async () => {
    const openButton = document.getElementById('open-settings');
    const browserNotifInput = document.getElementById('browser-notifications');

    // Ouvrir le modal
    fireEvent.click(openButton);

    // Simuler le changement de notification
    browserNotifInput.checked = true;
    fireEvent.change(browserNotifInput);

    // Attendre que les promesses soient résolues
    await new Promise(resolve => setTimeout(resolve, 100));

    // Vérifier que la permission est demandée et les préférences sont mises à jour
    expect(mockNotificationService.requestPermission).toHaveBeenCalled();
    expect(mockPreferencesService.updatePreferences).toHaveBeenCalledWith({ browser: true });
  });

  test('should handle sound notification changes', async () => {
    const openButton = document.getElementById('open-settings');
    const soundNotifInput = document.getElementById('sound-notifications');

    // Ouvrir le modal
    fireEvent.click(openButton);

    // Simuler le changement de notification
    soundNotifInput.checked = true;
    fireEvent.change(soundNotifInput);

    // Attendre que les promesses soient résolues
    await new Promise(resolve => setTimeout(resolve, 100));

    // Vérifier que les paramètres sont mis à jour
    expect(mockPreferencesService.updatePreferences).toHaveBeenCalledWith({ sound: true });
  });
});
