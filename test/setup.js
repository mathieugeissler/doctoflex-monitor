// test/setup.js
import '@testing-library/jest-dom';

// Polyfill pour setImmediate
global.setImmediate = (callback) => setTimeout(callback, 0);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Object.defineProperty(window, 'socket', {
  value: {
    on: jest.fn(),
    emit: jest.fn(),
  },
  writable: true,
});
