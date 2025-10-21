export interface Config {
  linearApiKey: string;
  linearTeamId: string;
}

export function getConfig(): Config {
  const linearApiKey = process.env.LINEAR_API_KEY;
  const linearTeamId = process.env.LINEAR_TEAM_ID;

  if (!linearApiKey) {
    throw new Error('LINEAR_API_KEY is required');
  }

  if (!linearTeamId) {
    throw new Error('LINEAR_TEAM_ID is required');
  }

  return {
    linearApiKey,
    linearTeamId,
  };
}
