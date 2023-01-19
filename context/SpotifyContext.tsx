import axios from 'axios';
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useState, useMemo } from 'react';
import { PlaylistType, SearchResults, Track } from '../types/types';

interface ContextProps {
  playlists: PlaylistType[];
  searchResults: SearchResults | null;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  fetchPlaylists: () => void;
  fetchSearchResults: (query: string) => void;
  currentTrack: Track | null;
  setCurrentTrack: Dispatch<SetStateAction<Track | null>>;
  tracksQueue: Track[];
  setTracksQueue: Dispatch<SetStateAction<Track[]>>;
}

const SpotifyContext = createContext<ContextProps | null>(null);

interface Props {
  children: React.ReactNode;
}

export const SpotifyProvider = ({ children }: Props) => {
  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [tracksQueue, setTracksQueue] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [query, setQuery] = useState('');

  const fetchPlaylists = useCallback(async () => {
    try {
      const resp = await axios.get('/api/playlists');
      const data = resp.data;
      setPlaylists(data.items);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const fetchSearchResults = useCallback(async () => {
    try {
      const resp = await axios.get(`/api/search?q=${query}`);
      setSearchResults(resp.data);
    } catch (err) {
      console.error(err);
    }
  }, [query]);

  const memoizedContextValue = useMemo(
    () => ({
      playlists,
      fetchPlaylists,
      query,
      setQuery,
      searchResults,
      fetchSearchResults,
      currentTrack,
      setCurrentTrack,
      tracksQueue,
      setTracksQueue,
    }),
    [playlists, fetchPlaylists, query, setQuery, searchResults, fetchSearchResults, currentTrack, setCurrentTrack, tracksQueue, setTracksQueue]
  );

  return <SpotifyContext.Provider value={memoizedContextValue}>{children}</SpotifyContext.Provider>;
};

export const useSpotify = () => {
  const spotifyContext = useContext(SpotifyContext);
  if (!spotifyContext) throw new Error('You need to use this context inside a provider');
  return spotifyContext;
};
