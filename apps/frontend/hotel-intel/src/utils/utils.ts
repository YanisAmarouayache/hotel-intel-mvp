export function parseDate(d: unknown): Date | null {
  if (!d) return null;
  if (typeof d === "string" || typeof d === "number" || d instanceof Date) {
    return new Date(d);
  }
  return null;
}

export function formatDateFR(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR");
}