export function parseDependencies(description: string): string[] {
  // Extract task IDs mentioned in description (T001, T002, etc.)
  const matches = description.match(/T\d+/g);
  return matches || [];
}
