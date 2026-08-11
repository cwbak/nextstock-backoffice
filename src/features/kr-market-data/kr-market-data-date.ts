function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCurrentLocalDate() {
  return formatLocalDate(new Date());
}

export function getPreviousLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);

  date.setDate(date.getDate() - 1);

  return formatLocalDate(date);
}
