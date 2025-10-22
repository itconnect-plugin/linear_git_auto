"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDuplicate = checkDuplicate;
const manager_1 = require("../mapping/manager");
function checkDuplicate(taskId) {
    return (0, manager_1.findMappingByTaskId)(taskId) !== undefined;
}
//# sourceMappingURL=dedup.js.map