const CONTROL_CHARACTER = /\p{Cc}/u;
const EDGE_SPACES = /^ +| +$/g;
const REPEATED_SPACES = / {2,}/g;
const ACCENT_MARKS = /\p{Mn}/gu;
const LETTER = /\p{L}/u;
const DIGIT = /[0-9]/;

export function hasControlCharacters(value: string): boolean {
  return CONTROL_CHARACTER.test(value);
}

export function hasDigits(value: string): boolean {
  return DIGIT.test(value);
}

export function countCharacters(value: string): number {
  return Array.from(value).length;
}

export function countWords(value: string): number {
  return value.split(' ').filter((part) => LETTER.test(part)).length;
}

export function normalizeName(value: string): string | undefined {
  const normalized = value
    .replace(EDGE_SPACES, '')
    .replace(REPEATED_SPACES, ' ');
  return normalized === '' ? undefined : normalized;
}

export function removeAccents(value: string): string {
  return value.normalize('NFD').replace(ACCENT_MARKS, '');
}

function sortKey(name: string): number[] {
  return Array.from(removeAccents(name.toLowerCase()), (char) =>
    char.codePointAt(0)!,
  );
}

export function compareNames(a: string, b: string): number {
  const left = sortKey(a);
  const right = sortKey(b);
  const length = Math.min(left.length, right.length);

  for (let i = 0; i < length; i++) {
    if (left[i] !== right[i]) {
      return left[i] - right[i];
    }
  }
  return left.length - right.length;
}

export function compareByNameAndId(
  a: { name: string; id: number },
  b: { name: string; id: number },
): number {
  return compareNames(a.name, b.name) || a.id - b.id;
}
