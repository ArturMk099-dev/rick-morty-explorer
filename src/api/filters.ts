import type { CharactersResponse } from "../types";

export async function loadFilterOptions(signal: AbortSignal) {
  const firstResponse = await fetch(
    "https://rickandmortyapi.com/api/character",
    { signal },
  );
  if (!firstResponse.ok) {
    throw new Error("Could not load filter options.");
  }
  const firstPage: CharactersResponse = await firstResponse.json();
  let optionCharacters = firstPage.results;
  if (firstPage.info.pages > 1) {
    const lastResponse = await fetch(
      `https://rickandmortyapi.com/api/character?page=${firstPage.info.pages}`,
      { signal },
    );
    if (!lastResponse.ok) {
      throw new Error("Could not load filter options.");
    }
    const lastPage: CharactersResponse = await lastResponse.json();
    optionCharacters = [...optionCharacters, ...lastPage.results];
  }
  return {
    statuses: [...new Set(optionCharacters.map((item) => item.status))],
    genders: [...new Set(optionCharacters.map((item) => item.gender))],
  };
}
