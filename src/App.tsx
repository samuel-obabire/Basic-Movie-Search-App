import {useEffect, useState} from "react";
import {useDebounce} from "react-use";

import Search from "./components/Search.tsx";
import Spinner from "./components/Spinner.tsx";
import MovieCard from "./components/MovieCard.tsx";
import {getTrendingMovies, updateSearchCount} from "./appwrite.ts";

import type {APIResponse, Movie, MovieDoc} from "./types";


const API_BASE_URL = 'https://api.themoviedb.org/3';

const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`
    }
};


const App = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
    const [movies, setMovies] = useState<Movie[]>([])
    const [trendingMovies, setTrendingMovies] = useState<MovieDoc[]>([])
    const [errorMessage, setErrorMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    useDebounce(() => setDebouncedSearchTerm((searchTerm)), 700, [searchTerm])

    useEffect(() => {
        fetchMovies(debouncedSearchTerm)
    }, [debouncedSearchTerm]);

    useEffect(() => {
        trendingMoviesFetch()
    }, []);


    const fetchMovies = async (query?: string): Promise<void> => {
        setIsLoading(true)
        setMovies([])

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS)

            if (!response.ok) {
                setErrorMessage("Error fetching movies")
                setMovies([])

                return
            }

            const data = await response.json() as APIResponse

            if ("success" in data && !data.success) {
                setErrorMessage(data.status_message || "Error fetching movies")
                setMovies([])
            } else if ('results' in data) {
                setMovies(data.results)

                if (query && data.results.length > 0) {
                    await updateSearchCount(query, data.results[0])
                }
            } else {
                setMovies([])
                setErrorMessage("Error fetching movies")
            }


        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            setErrorMessage(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const trendingMoviesFetch = async () => {
        try {
            const movies = await getTrendingMovies()
            setTrendingMovies(movies || [])
        } catch (e) {
            console.error(e)
        }
    }


    return (
        <main>
            <div className="pattern"/>

            <div className="wrapper">
                <header>
                    <img src="/hero.png" alt="Hero Banner"/>
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy without the Hassle</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2 className="">Trending Movies</h2>
                        <ul>
                            {trendingMovies.map((movie, index) => {
                                return <li className="" key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title}/>
                                </li>
                            })}
                        </ul>
                    </section>
                )}

                <section className="all-movies">
                    <h2 className="">All Movies</h2>
                    {isLoading ? <Spinner/> : errorMessage ?
                        <p className="text-red-500">{errorMessage}</p> :
                        (
                            <ul>{movies.map((movie) => {
                                return <li className="text-white" key={movie.id}>
                                    <MovieCard {...movie}/>
                                </li>
                            })}</ul>
                        )}
                </section>

            </div>
        </main>
    )
}

export default App;
