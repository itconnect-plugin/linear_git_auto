"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.createLogger = createLogger;
const pino_1 = __importDefault(require("pino"));
function createLogger() {
    return (0, pino_1.default)({
        level: process.env.LOG_LEVEL || 'info',
        redact: {
            paths: ['apiKey', 'LINEAR_API_KEY', 'token', 'password', 'secret'],
            remove: true,
        },
        formatters: {
            level: (label) => {
                return { level: label };
            },
        },
    });
}
exports.logger = createLogger();
//# sourceMappingURL=logger.js.map