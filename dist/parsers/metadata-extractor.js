"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMetadata = extractMetadata;
function extractMetadata(taskTitle) {
    const isParallel = taskTitle.includes('[P]');
    const userStoryMatch = taskTitle.match(/\[US(\d+)\]/);
    const userStory = userStoryMatch ? `US${userStoryMatch[1]}` : undefined;
    return { isParallel, userStory };
}
//# sourceMappingURL=metadata-extractor.js.map