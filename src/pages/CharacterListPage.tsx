import { useEffect, useState } from "react";
import type { Character, CharactersResponse } from "../types";
import { Link, useSearchParams } from "react-router-dom";
function CharacterListPage() {
  const pageTitle = "Rick & Morty Explorer";
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("name") ?? "",
  );
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const pageFormUrl = Number(searchParams.get("page") ?? "1");
  const initialPage =
    Number.isInteger(pageFormUrl) && pageFormUrl > 0 ? pageFormUrl : 1;
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [nextRequestAt, setNextRequestAt] = useState(0);
  const [statusOption, setStatusOptions] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState(
    (searchParams.get("status") ?? "").toLowerCase(),
  );
  const [genderOptions, setGenderOptions] = useState<string[]>([]);
  const [appliedParams, setAppliedParams] = useState(searchParams);
  const [selectedGender, setSelectedGender] = useState(
    (searchParams.get("gender") ?? "").toLowerCase(),
  );
  const hasPendingFilters =
    searchQuery.trim() !== (appliedParams.get("name") ?? "").trim() ||
    selectedStatus !== (appliedParams.get("status") ?? "").toLowerCase() ||
    selectedGender !== (appliedParams.get("gender") ?? "").toLowerCase();
  async function loadCharacters(pageNumber: number) {
    if (isLoading) return;
    const now = Date.now();
    if (now < nextRequestAt) {
      const seconds = Math.ceil((nextRequestAt - now) / 1000);
      setErrorMessage(`Please wait ${seconds} seconds before trying again.`);
      return;
    }
    setNextRequestAt(now + 2000);
    setHasSearched(true);
    setIsLoading(true);
    setErrorMessage("");
    try {
      const params = new URLSearchParams({
        name: searchQuery.trim(),
        page: String(pageNumber),
      });
      if (selectedStatus !== "") {
        params.set("status", selectedStatus);
      }
      if (selectedGender !== "") {
        params.set("gender", selectedGender);
      }
      setSearchParams(params);
      const response = await fetch(
        `https://rickandmortyapi.com/api/character?${params}`,
      );
      if (response.status === 404) {
        setCharacters([]);
        setTotalPages(0);
        return;
      }
      if (!response.ok) {
        throw new Error(`Request failed:${response.status}`);
      }
      const data: CharactersResponse = await response.json();
      setCharacters(data.results);
      const receivedStatuses = data.results.map(
        (character) => character.status,
      );
      setStatusOptions((previousOptions) => [
        ...new Set([...previousOptions, ...receivedStatuses]),
      ]);
      const receivedGenders = data.results.map((character) => character.gender);
      setGenderOptions((previousOptions) => [
        ...new Set([...previousOptions, ...receivedGenders]),
      ]);
      setTotalPages(data.info.pages);
      setPage(pageNumber);
      setAppliedParams(params);
    } catch (error) {
      console.error(error);
      setNextRequestAt(Date.now() + 30000);
      setErrorMessage("Could not load characters. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    loadCharacters(initialPage);
  }, []);

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
      <label>
        Status
        <select
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          {statusOption.map((status) => (
            <option key={status} value={status.toLowerCase()}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label>
        Gender
        <select
          value={selectedGender}
          onChange={(event) => setSelectedGender(event.target.value)}
        >
          <option value="">All Genders</option>
          {genderOptions.map((gender) => (
            <option key={gender} value={gender.toLowerCase()}>
              {gender}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={() => setSearchQuery("")}>
        Clear Search
      </button>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => loadCharacters(1)}
      >
        Load Characters
      </button>
      {isLoading && <p>Loading characters...</p>}
      {errorMessage && <p role="alert">{errorMessage}</p>}
      {hasSearched &&
        !isLoading &&
        !errorMessage &&
        characters.length === 0 && <p> No characters found.</p>}
      {totalPages > 0 && (
        <div>
          <button
            type="button"
            disabled={isLoading || hasPendingFilters || page <= 1}
            onClick={() => loadCharacters(page - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={isLoading || hasPendingFilters || page >= totalPages}
            onClick={() => loadCharacters(page + 1)}
          >
            Next
          </button>
        </div>
      )}
      <ul>
        {characters.map((character) => (
          <li key={character.id}>
            <Link
              to={`./characters/${character.id}?${appliedParams.toString()}`}
              style={{ display: "block" }}
            >
              <h2>{character.name}</h2>
              <img src={character.image} alt={character.name} width={150} />
              <p>
                {character.status} {character.species}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
export default CharacterListPage;
