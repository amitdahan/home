import fetch, { HeadersInit } from "node-fetch";

const { SONARR_URL, SONARR_TOKEN } = process.env;

export interface Image {
  coverType: "fanart" | "banner" | "poster";
  url: string;
  remoteUrl: string;
}

export interface Season {
  seasonNumber: number;
  monitored: boolean;
  statistics: {
    previousAiring: string;
    episodeFileCount: number;
    episodeCount: number;
    totalEpisodeCount: number;
    sizeOnDisk: number;
    percentOfEpisodes: number;
  };
}

export interface Series {
  title: string;
  sortTitle: string;
  seasonCount: number;
  status: "continuing" | "ended";
  overview: string;
  images: Image[];
  remotePoster: string;
  seasons: Season[];
  year: number;
  profileId: number;
  languageProfileId: number;
  seasonFolder: boolean;
  monitored: boolean;
  useSceneNumbering: boolean;
  runtime: number;
  tvdbId: number;
  tvRageId: number;
  tvMazeId: number;
  firstAired: string;
  seriesType: "standard";
  cleanTitle: string;
  imdbId: string;
  titleSlug: string;
  genres: string[];
  tags: string[];
  added: string;
  ratings: {
    votes: number;
    value: number;
  };
  qualityProfileId: number;
}

export interface AddSeriesOptions {
  tvdbId: number;
  title: string;
  profileId: number;
  titleSlug: string;
  images: Image[];
  seasons: Season[];
}

export interface Sonarr {
  search(searchTerm: string): Promise<Series[]>;

  addSeries(options: Series): Promise<void>;
}

export function setupSonarr(): Sonarr {
  if (!SONARR_TOKEN) {
    throw new Error("No SONARR_TOKEN provided");
  }
  if (!SONARR_URL) {
    throw new Error("No SONARR_URL provided");
  }

  const headers: HeadersInit = {
    "X-Api-Key": SONARR_TOKEN,
  };

  async function get(url: string, query: Record<string, string>) {
    const queryString = Object.keys(query)
      .map((key) => `${key}=${encodeURIComponent(query[key])}`)
      .join("&");

    const res = await fetch(`${SONARR_URL}/${url}?${queryString}`, { headers });

    return await res.json();
  }

  async function post(url: string, data: unknown) {
    const res = await fetch(`${SONARR_URL}/${url}`, {
      method: "post",
      body: JSON.stringify(data),
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });

    return await res.json();
  }

  return {
    async search(term) {
      return get("series/lookup", { term });
    },
    async addSeries(series: Series) {
      console.log(`adding ${series.title}...`);

      const options: AddSeriesOptions = {
        tvdbId: series.tvdbId,
        profileId: series.profileId,
        images: series.images,
        seasons: series.seasons,
        title: series.title,
        titleSlug: series.titleSlug,
      };
      return await post("series", options);
    },
  };
}
