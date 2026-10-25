import { useEffect, useState } from "react";
import type { Character , Episode } from "../types";
import { Link, useParams, useSearchParams } from "react-router-dom";

function CharacterDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [episodes,setEpisodes] = useState<Episode[]>([]);
  useEffect(() => {
    async function loadCharacter() {
      setIsLoading(true);
      setErrorMessage("");
      setIsNotFound(false);
      setCharacter(null);
      setEpisodes([]);
      try {
        const characterId = Number(id);
        if(!Number.isSafeInteger(characterId) || characterId <= 0){
            setIsNotFound(true);
            return;
        }
        const response = await fetch(
          `https://rickandmortyapi.com/api/character/${characterId}`,
        );
        if (response.status === 404) {
          setIsNotFound(true);
          return;
        }
        if (!response.ok) {
          throw new Error(`Request Failed: ${response.status}`);
        }
        const data: Character = await response.json();
        setCharacter(data);
        if(data.episode.length > 0){
            const episodeIds = data.episode.map((url)=>url.split("/").pop()).join(",");
            const episodeResponse = await fetch(`https://rickandmortyapi.com/api/episode/${episodeIds}`);
            if(!episodeResponse.ok){
             throw new Error(`Episodes request failed: ${episodeResponse.status}`);   
            }
            const episodesData : Episode | Episode[] = await episodeResponse.json(); 
            setEpisodes(Array.isArray(episodesData) ? episodesData : [episodesData])
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Could not load character details. Please try again");
      } finally {
        setIsLoading(false);
      }
    }
    loadCharacter();
  }, [id, retryCount]);

  return (
    <main>
      <h1>Character details</h1>
      <Link to={`/?${searchParams.toString()}`}>Back to list</Link>
      {isLoading && <p>Loading Character details...</p>}
      {errorMessage && (
        <div>
          <p role="alert">{errorMessage}</p>
          <button type="button" disabled={isLoading} onClick={()=>setRetryCount((previous)=>previous + 1)}>Try again</button>
        </div>
      )}
      {isNotFound && <p>Character not found.</p>}
      {character && (
        <div>
          <h2>{character.name}</h2>
          <img src={character.image} alt={character.name} width={200} />
          <p>Status: {character.status}</p>
          <p>Species: {character.species}</p>
          <p>Gender: {character.gender}</p>
          <p>Origin: {character.origin.name}</p>
          <p>Location: {character.location.name}</p>
          <p>Episodes: {character.episode.length}</p>
          {episodes.length > 0 &&(
            <ul>
                {episodes.map((episode)=>(
                    <li key={episode.id}>
                       {episode.episode} - {episode.name}
                    </li>
                ))}
            </ul>
          )}
          {!isLoading && !errorMessage && episodes.length === 0 && (
            <p>No episodes found.</p>
          )}
        </div>
      )}
    </main>
  );
}

export default CharacterDetailsPage;
