const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatUsdMarketCap(value: string | null) {
  if (value === null) {
    return "-";
  }

  const [integer = "0", fraction] = value.split(".");
  const formattedInteger = BigInt(integer).toLocaleString("en-US");

  return `$${formattedInteger}${fraction ? `.${fraction}` : ""}`;
}
