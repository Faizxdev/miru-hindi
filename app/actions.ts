"use server";

import { 
  fetchAnimeList, 
  fetchMoviesList, 
  fetchAnimeDetails, 
  searchAnime,
  fetchCartoonList,
  fetchOngoingSeries,
  fetchNetworkContent,
  fetchLetterList
} from "@/server/scraper";

export async function getAnimeAction(page: number) {
  try {
    const data = await fetchAnimeList(page);
    return data.items || [];
  } catch (error) {
    console.error("Action Error: getAnimeAction", error);
    return [];
  }
}

export async function getMoviesAction(query: string | undefined, page: number) {
  try {
    const data = await fetchMoviesList(page, query);
    return data.items || [];
  } catch (error) {
    console.error("Action Error: getMoviesAction", error);
    return [];
  }
}

export async function searchAnimeAction(query: string, page: number = 1) {
    try {
        const results = await searchAnime(query, page);
        return results || [];
    } catch (error) {
        console.error("Action Error: searchAnimeAction", error);
        return [];
    }
}

export async function getLetterAction(letter: string, page: number) {
  try {
    const data = await fetchLetterList(letter, page);
    return data.items || [];
  } catch (error) {
    console.error("Action Error: getLetterAction", error);
    return [];
  }
}

export async function getNetworkAction(slug: string, query: string | undefined, page: number) {
  try {
    const data = await fetchNetworkContent(slug, page, query);
    return data.items || [];
  } catch (error) {
    console.error("Action Error: getNetworkAction", error);
    return [];
  }
}

export async function getCartoonAction(query: string | undefined, page: number) {
  try {
    const data = await fetchCartoonList(page, query);
    return data.items || [];
  } catch (error) {
    console.error("Action Error: getCartoonAction", error);
    return [];
  }
}

export async function getOngoingAction(query: string | undefined, page: number) {
  try {
    const data = await fetchOngoingSeries(page, query);
    return data.items || [];
  } catch (error) {
    console.error("Action Error: getOngoingAction", error);
    return [];
  }
}
