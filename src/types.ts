export interface Character {
    id:number;
    name:string;
    status:string;
    species:string;
    image:string;
    gender:string;
    origin:{
        name:string;
    }
    location:{
        name:string;
    }
    episode:string[];
}
export interface CharactersResponse {
    info:{
        pages:number;
    }
    results: Character[];
}

export interface Episode {
    id:number;
    name:string;
    episode:string;
}