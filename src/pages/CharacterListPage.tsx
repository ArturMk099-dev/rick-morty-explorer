import { useEffect, useState } from "react";
import type { Character, CharactersResponse } from "../types";
import { Link, useSearchParams } from "react-router-dom";
import { loadFilterOptions } from "../api/filters";
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
  const [retryCount, setRetryCount] = useState(0);
  const [hasRequestError, setHasRequesterror] = useState(false);
  const [filtersError, setFiltersError] = useState("");
  const [filtersRetryCount, setFiltersRetryCount] = useState(0);
  function createParams(PageNumber: number) {
    const params = new URLSearchParams({
      name: searchQuery.trim(),
      page: String(PageNumber),
    });
    if (selectedStatus !== "") {
      params.set("status", selectedStatus);
    }
    if (selectedGender !== "") {
      params.set("gender", selectedGender);
    }
    return params;
  }
  function applyParams(params: URLSearchParams) {
    if (isLoading) return;
    const now = Date.now();
    if (now < nextRequestAt) {
      const seconds = Math.ceil((nextRequestAt - now) / 1000);
      setErrorMessage(`Please wait ${seconds} seconds before trying again.`);
      return;
    }
    if (params.toString() === searchParams.toString()) {
      setRetryCount((previous) => previous + 1);
      return;
    }
    setSearchParams(params);
  }
  useEffect(() => {
    const controller = new AbortController();
    async function loadOptions() {
      setFiltersError("");
      try {
        const options = await loadFilterOptions(controller.signal);
        if (controller.signal.aborted) return;
        setStatusOptions((previous) => [
          ...new Set([...previous, ...options.statuses]),
        ]);
        setGenderOptions((previous) => [
          ...new Set([...previous, ...options.genders]),
        ]);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setFiltersError("Could not load filters. Please try again.");
      }
    }
    loadOptions();
    return () => controller.abort();
  }, [filtersRetryCount]);
  useEffect(() => {
    const controller = new AbortController();
    const urlName = (searchParams.get("name") ?? "").trim();
    const urlStatus = (searchParams.get("status") ?? "").toLowerCase();
    const urlGender = (searchParams.get("gender") ?? "").toLowerCase();
    const params = new URLSearchParams({
      name: urlName,
      page: String(initialPage),
    });
    if (urlStatus !== "") params.set("status", urlStatus);
    if (urlGender !== "") params.set("gender", urlGender);
    setSearchQuery(urlName);
    setSelectedStatus(urlStatus);
    setSelectedGender(urlGender);
    async function loadCharacters() {
      setNextRequestAt(Date.now() + 2000);
      setHasSearched(true);
      setIsLoading(true);
      setErrorMessage("");
      setHasRequesterror(false);
      try {
        const response = await fetch(
          `https://rickandmortyapi.com/api/character?${params}`,
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        if (response.status === 404) {
          setCharacters([]);
          setTotalPages(0);
          setPage(initialPage);
          setAppliedParams(params);
          return;
        }
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const data: CharactersResponse = await response.json();
        if (controller.signal.aborted) return;
        setCharacters(data.results);
        const receivedStatuses = data.results.map(
          (character) => character.status,
        );
        setStatusOptions((previousOptions) => [
          ...new Set([...previousOptions, ...receivedStatuses]),
        ]);
        const receivedGenders = data.results.map(
          (character) => character.gender,
        );
        setGenderOptions((previousOptions) => [
          ...new Set([...previousOptions, ...receivedGenders]),
        ]);
        setTotalPages(data.info.pages);
        setPage(initialPage);
        setAppliedParams(params);
      } catch (error) {
        if (controller.signal.aborted) return;
        setHasRequesterror(true);
        console.error(error);
        setNextRequestAt(Date.now() + 30000);
        setErrorMessage("Could not load characters. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }
    loadCharacters();
    return () => controller.abort();
  }, [searchParams, initialPage, retryCount]);
  return (
    <main>
      <h1>{pageTitle}</h1>
      <p>Explore characters from the Rick and Morty universe.</p>
      <div className="filters">
        <label>
          Search by name
          <input
            placeholder="Search characters..."
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
          className="button-primary"
          type="button"
          disabled={isLoading}
          onClick={() => applyParams(createParams(1))}
        >
          Load Characters
        </button>
      </div>
      {filtersError && (
        <div>
          <p role="alert">{filtersError}</p>
          <button
            type="button"
            className="details-retry"
            onClick={() => setFiltersRetryCount((previous) => previous + 1)}
          >
            Retry filters
          </button>
        </div>
      )}
      {isLoading && <p>Loading characters...</p>}

      {errorMessage && (
        <div>
          <p role="alert">{errorMessage}</p>
          {hasRequestError && (
            <button
              type="button"
              className="details-retry"
              disabled={isLoading}
              onClick={() => applyParams(searchParams)}
            >
              Try again
            </button>
          )}
        </div>
      )}

      {hasSearched &&
        !isLoading &&
        !errorMessage &&
        characters.length === 0 && <p> No characters found.</p>}
      {totalPages > 0 && (
        <div className="pagination">
          <button
            type="button"
            disabled={isLoading || hasPendingFilters || page <= 1}
            onClick={() => applyParams(createParams(page - 1))}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={isLoading || hasPendingFilters || page >= totalPages}
            onClick={() => applyParams(createParams(page + 1))}
          >
            Next
          </button>
        </div>
      )}
      <ul className="character-grid">
        {characters.map((character) => (
          <li key={character.id}>
            <Link
              to={`./characters/${character.id}?${appliedParams.toString()}`}
              className="character-card"
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
