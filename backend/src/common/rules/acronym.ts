import { removeAccents } from './text';

const ACRONYM_FORMAT = /^[A-Z]{3}$/;
const LETTER = /\p{L}/u;

export function hasAcronymFormat(acronym: string): boolean {
  return ACRONYM_FORMAT.test(acronym);
}

export function hasRepeatedLettersOnly(acronym: string): boolean {
  return new Set(acronym).size === 1;
}

export function acronymMatchesName(acronym: string, name: string): boolean {
  const letters = Array.from(removeAccents(name).toUpperCase()).filter((char) =>
    LETTER.test(char),
  );

  if (letters[0] !== acronym[0]) {
    return false;
  }

  let next = 1;
  for (const letter of letters.slice(1)) {
    if (letter === acronym[next]) {
      next++;
    }
    if (next === acronym.length) {
      return true;
    }
  }
  return false;
}
