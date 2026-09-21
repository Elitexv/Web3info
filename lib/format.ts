export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function truncate(text: string, length: number) {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "...";
}
