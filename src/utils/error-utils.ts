export const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : String(e);

export const asError = (e: unknown) =>
  e instanceof Error ? e : new Error(errorMessage(e));
