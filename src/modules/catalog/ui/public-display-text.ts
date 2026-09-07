export function formatPublicDisplayText(value: string) {
  return value
    .trim()
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/(^|\s)([¿¡]?)(\p{L})/gu, (_, spacing: string, punctuation: string, letter: string) => `${spacing}${punctuation}${letter.toLocaleUpperCase("es-CR")}`);
}
