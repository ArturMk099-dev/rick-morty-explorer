import { useEffect, useState } from "react";
import type { Character, Episode } from "../types";
import { Link, useParams, useSearchParams } from "react-router-dom";

function CharacterDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    async function loadCharacter() {
      setIsLoading(true);
      setErrorMessage("");
      setIsNotFound(false);
      setCharacter(null);
      setEpisodes([]);
      try {
        const characterId = Number(id);
        if (!Number.isSafeInteger(characterId) || characterId <= 0) {
          setIsNotFound(true);
          return;
        }
        const response = await fetch(
          `https://rickandmortyapi.com/api/character/${characterId}`,
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        if (response.status === 404) {
          setIsNotFound(true);
          return;
        }
        if (!response.ok) {
          throw new Error(`Request Failed: ${response.status}`);
        }
        const data: Character = await response.json();
        if (controller.signal.aborted) return;
        setCharacter(data);
        if (data.episode.length > 0) {
          const episodeIds = data.episode
            .map((url) => url.split("/").pop())
            .join(",");
          const episodeResponse = await fetch(
            `https://rickandmortyapi.com/api/episode/${episodeIds}`,
            { signal: controller.signal },
          );
          if (controller.signal.aborted) return;
          if (!episodeResponse.ok) {
            throw new Error(
              `Episodes request failed: ${episodeResponse.status}`,
            );
          }
          const episodesData: Episode | Episode[] =
            await episodeResponse.json();
          if (controller.signal.aborted) return;
          setEpisodes(
            Array.isArray(episodesData) ? episodesData : [episodesData],
          );
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setErrorMessage("Could not load character details. Please try again");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }
    loadCharacter();
    return () => controller.abort();
  }, [id, retryCount]);
  return (
    <main className="details-page">
      <h1>Character details</h1>
      <Link to={`/?${searchParams.toString()}`} className="details-back">
        Back to list
      </Link>
      {isLoading && <p>Loading Character details...</p>}
      {errorMessage && (
        <div>
          <p role="alert">{errorMessage}</p>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setRetryCount((previous) => previous + 1)}
            className="details-retry"
          >
            Try again
          </button>
        </div>
      )}
      {isNotFound && <p>Character not found.</p>}
      {character && (
        <article className="details-card">
          <h2>{character.name}</h2>

          <div className="details-profile">
            <img
              className="details-image"
              src={character.image}
              alt={character.name}
              width={280}
              height={280}
            />

            <div className="details-info">
              <p>
                <strong>Status:</strong> {character.status}
              </p>
              <p>
                <strong>Species:</strong> {character.species}
              </p>
              <p>
                <strong>Gender:</strong> {character.gender}
              </p>
              <p>
                <strong>Origin:</strong> {character.origin.name}
              </p>
              <p>
                <strong>Location:</strong> {character.location.name}
              </p>
              <p>
                <strong>Episodes:</strong> {character.episode.length}
              </p>
            </div>
          </div>

          {episodes.length > 0 && (
            <section className="details-episodes">
              <h3>Episodes</h3>

              <ul className="episode-list">
                {episodes.map((episode) => (
                  <li key={episode.id}>
                    <strong>{episode.episode}</strong>
                    <span>{episode.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!isLoading && !errorMessage && episodes.length === 0 && (
            <p>No episodes found.</p>
          )}
        </article>
      )}
    </main>
  );
}

export default CharacterDetailsPage;
