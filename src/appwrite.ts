import {Client, Databases, ID, Query} from "appwrite";
import type {MovieDoc, Movie} from "./types";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID as string;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID as string;

const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm: string, movie: Movie) => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm),
        ])

        if (result.documents.length > 0) {
            const doc = result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1
            })
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
            })
        }
    } catch (e) {
        console.error(e)
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count'),
        ])
        return result.documents as unknown as MovieDoc[];
    } catch (e) {
        console.error(e)
    }
}

