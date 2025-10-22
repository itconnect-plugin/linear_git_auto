"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearClient = void 0;
const sdk_1 = require("@linear/sdk");
const errors_1 = require("../lib/errors");
class LinearClient {
    client;
    constructor(apiKey) {
        const key = apiKey || process.env.LINEAR_API_KEY;
        if (!key) {
            throw new errors_1.ConfigurationError('LINEAR_API_KEY is required');
        }
        this.client = new sdk_1.LinearClient({ apiKey: key });
    }
    getClient() {
        return this.client;
    }
}
exports.LinearClient = LinearClient;
//# sourceMappingURL=client.js.map