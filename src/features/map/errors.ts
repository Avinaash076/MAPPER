// Keep provider URLs and any future credentials out of user-facing diagnostics.
export function mapFailureMessage(problem: unknown): string {
  const message = problem instanceof Error ? problem.message : String(problem);
  if (/webgl|graphics|gpu|context.*lost/i.test(message))
    return 'The browser could not start the map graphics. Enable graphics acceleration or try another browser. You can still browse the place list.';
  if (/worker|module|script/i.test(message))
    return 'The map renderer could not start. Reload the app or use the place list, then retry the map.';
  if (/fetch|network|load|timeout|timed out|http|connection/i.test(message))
    return 'Some online map resources could not load. Check your connection and retry, or browse the place list.';
  return 'The map could not be displayed. Retry the map or browse the place list.';
}
