import { useState } from "react";
import type { Character } from "./types";
function App() {
  const pageTitle = "Rick & Morty Explorer";
  const [searchQuery, setSearchQuery] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage,setErrorMessage] = useState("");
  const [hasSearched,setHasSearched] = useState(false);
  async function loadCharacters() {
    setHasSearched(true);
    setIsLoading(true);
    setErrorMessage("");
    try {
      const params = new URLSearchParams({ name: searchQuery.trim() });
      const response = await fetch(
        `https://rickandmortyapi.com/api/character?${params}`,
      );
      if (response.status === 404) {
        setCharacters([]);
        return;
      }
      if(!response.ok){
        throw new Error("Request failed")
      }
      const data = await response.json();
      setCharacters(data.results);
    }catch(error){
      setErrorMessage("Could not load characters. Please try again.");
      setCharacters([]);
    }
     finally {
        setIsLoading(false);
    }
  }

  return (
    <main>
      <h1>{pageTitle}</h1>
      <p>Explore characters from the Rick and Morty universe.</p>
      <label>
        Search by name
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </label>
      <button type="button" onClick={() => setSearchQuery("")}>
        Clear Search
      </button>
      <button type="button" disabled={isLoading} onClick={loadCharacters}>
        Load Characters
      </button>
      {isLoading && <p>Loading characters...</p>}
      {errorMessage && <p role="alert">{errorMessage}</p>}
      {hasSearched && !isLoading && !errorMessage && characters.length === 0 && <p> No characters found.</p>}
      <ul>
        {characters.map((character) => (
          <li key={character.id}>
            <h2>{character.name}</h2>
            <img src={character.image} alt={character.name} width={150} />
            <p>
              {character.status} {character.species}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
export default App;
