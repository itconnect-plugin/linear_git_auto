"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDependencies = parseDependencies;
function parseDependencies(description) {
    // Extract task IDs mentioned in description (T001, T002, etc.)
    const matches = description.match(/T\d+/g);
    return matches || [];
}
//# sourceMappingURL=dependency-parser.js.map