"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTasksFile = parseTasksFile;
function parseTasksFile(content) {
    const lines = content.split('\n');
    const tasks = [];
    let currentPhase = '';
    for (const line of lines) {
        // Track current phase
        if (line.match(/^##\s+Phase\s+\d+:/i)) {
            currentPhase = line.replace(/^##\s+/, '').trim();
            continue;
        }
        // Match task line: - [ ] T001 [P] [US1] Description with src/file.ts
        const taskMatch = line.match(/^-\s+\[([ xX])\]\s+(T\d+)\s+(.+)$/);
        if (!taskMatch)
            continue;
        const [, , taskId, rest] = taskMatch;
        // Extract parallel marker [P]
        const isParallel = rest.includes('[P]');
        // Extract user story [US1], [US2], etc.
        const userStoryMatch = rest.match(/\[US(\d+)\]/);
        const userStory = userStoryMatch ? `US${userStoryMatch[1]}` : undefined;
        // Extract file path from description (e.g., "in src/file.ts")
        const filePathMatch = rest.match(/in\s+([\w/./-]+\.[\w]+)/);
        const filePath = filePathMatch ? filePathMatch[1] : undefined;
        // Remove markers from title
        let title = rest
            .replace(/\[P\]/g, '')
            .replace(/\[US\d+\]/g, '')
            .trim();
        const task = {
            id: taskId,
            title,
            description: title,
            phase: currentPhase,
            userStory,
            isParallel,
            filePath,
        };
        tasks.push(task);
    }
    return tasks;
}
//# sourceMappingURL=tasks-parser.js.map