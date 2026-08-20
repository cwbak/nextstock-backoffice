export function parseKrStockAliasesInput(
  value: unknown,
): Array<string> | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const aliases = value
    .split(/\r?\n/u)
    .map((alias) => alias.trim())
    .filter((alias) => alias.length > 0);
  const uniqueAliases = Array.from(new Set(aliases));

  return uniqueAliases.length > 0 ? uniqueAliases : undefined;
}
