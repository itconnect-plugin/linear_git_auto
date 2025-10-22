"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMappings = loadMappings;
exports.saveMappings = saveMappings;
exports.addMapping = addMapping;
exports.findMappingByTaskId = findMappingByTaskId;
exports.findMappingByLinearId = findMappingByLinearId;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DEFAULT_MAPPING_PATH = path.join(process.cwd(), '.specify', 'linear-mapping.json');
function getMappingPath() {
    return process.env.MAPPING_FILE_PATH || DEFAULT_MAPPING_PATH;
}
function ensureDirectoryExists(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
function loadMappings() {
    const mappingPath = getMappingPath();
    if (!fs.existsSync(mappingPath)) {
        return [];
    }
    try {
        const content = fs.readFileSync(mappingPath, 'utf-8');
        const mappings = JSON.parse(content);
        // Convert date strings back to Date objects
        return mappings.map((m) => ({
            ...m,
            createdAt: new Date(m.createdAt),
            updatedAt: new Date(m.updatedAt),
        }));
    }
    catch (error) {
        console.error('Failed to load mappings:', error);
        return [];
    }
}
function saveMappings(mappings) {
    const mappingPath = getMappingPath();
    ensureDirectoryExists(mappingPath);
    const content = JSON.stringify(mappings, null, 2);
    fs.writeFileSync(mappingPath, content, 'utf-8');
}
function addMapping(mapping) {
    const mappings = loadMappings();
    mappings.push(mapping);
    saveMappings(mappings);
}
function findMappingByTaskId(taskId) {
    const mappings = loadMappings();
    return mappings.find((m) => m.taskId === taskId);
}
function findMappingByLinearId(linearIssueId) {
    const mappings = loadMappings();
    return mappings.find((m) => m.linearIssueId === linearIssueId);
}
//# sourceMappingURL=manager.js.map