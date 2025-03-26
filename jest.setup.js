// Configuration de l'environnement de test
process.env.NODE_ENV = 'development';

// Mock des modules externes
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      goto: jest.fn().mockResolvedValue(null),
      type: jest.fn().mockResolvedValue(null),
      click: jest.fn().mockResolvedValue(null),
      waitForSelector: jest.fn().mockResolvedValue(null),
      evaluate: jest.fn().mockResolvedValue([]),
      close: jest.fn().mockResolvedValue(null)
    }),
    close: jest.fn().mockResolvedValue(null)
  })
}));

// Mock de winston pour éviter les logs pendant les tests
jest.mock('winston', () => ({
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    DailyRotateFile: jest.fn()
  },
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  })
}));

// Mock de socket.io
jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    getIO: jest.fn().mockReturnThis()
  }))
}));

// Mock de fs pour les tests de configuration
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(false),
  readFileSync: jest.fn().mockReturnValue('{}'),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn()
}));

// Mock de fs/promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue('{}'),
  writeFile: jest.fn().mockResolvedValue(undefined)
}));

// Mock winston-daily-rotate-file
jest.mock('winston-daily-rotate-file', () => ({
  default: jest.fn()
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn().mockReturnValue({
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn()
  })
}));

// Mock node-notifier
jest.mock('node-notifier', () => ({
  notify: jest.fn()
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args) => args.join('/')),
  resolve: jest.fn().mockImplementation((...args) => args.join('/'))
}));

process.env.DOCTOFLEX_URL = 'https://www.doctoflex.fr';
process.env.PORT = '3000';
process.env.SOCKET_PORT = '3001';
process.env.LOG_LEVEL = 'error'; 