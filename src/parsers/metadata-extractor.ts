export function extractMetadata(taskTitle: string): {
  isParallel: boolean;
  userStory?: string;
  priority?: string;
} {
  const isParallel = taskTitle.includes('[P]');
  const userStoryMatch = taskTitle.match(/\[US(\d+)\]/);
  const userStory = userStoryMatch ? `US${userStoryMatch[1]}` : undefined;

  return { isParallel, userStory };
}
