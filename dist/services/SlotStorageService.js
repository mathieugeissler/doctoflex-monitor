"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotStorageService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class SlotStorageService {
    storagePath;
    constructor() {
        this.storagePath = path_1.default.join(process.cwd(), 'data', 'slots.json');
    }
    async saveSlots(slots) {
        const data = {
            lastUpdate: new Date().toISOString(),
            slots: slots
        };
        try {
            // Assurer que le dossier data existe
            await promises_1.default.mkdir(path_1.default.dirname(this.storagePath), { recursive: true });
            // Sauvegarder les créneaux dans le fichier
            await promises_1.default.writeFile(this.storagePath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            throw new Error('Failed to save slots');
        }
    }
    async getLastUpdate() {
        try {
            const data = await promises_1.default.readFile(this.storagePath, 'utf-8');
            const parsedData = JSON.parse(data);
            return parsedData.lastUpdate || null;
        }
        catch (error) {
            return null;
        }
    }
    async loadSlots() {
        try {
            const data = await promises_1.default.readFile(this.storagePath, 'utf-8');
            const parsedData = JSON.parse(data);
            // Pour la rétrocompatibilité, si l'ancien format est utilisé
            const slots = Array.isArray(parsedData) ? parsedData : parsedData.slots;
            // Garder les dates en format string
            return slots;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                // Le fichier n'existe pas encore
                return [];
            }
            if (error instanceof SyntaxError) {
                throw new Error('Failed to parse slots data');
            }
            throw error;
        }
    }
}
exports.SlotStorageService = SlotStorageService;
//# sourceMappingURL=SlotStorageService.js.map