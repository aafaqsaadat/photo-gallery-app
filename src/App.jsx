
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import useFetchPhotos from './hooks/useFetchPhotos'

const STORAGE_KEY = 'photo-gallery-favourites'

function getSavedFavourites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const ids = saved ? JSON.parse(saved) : []
    return Array.isArray(ids) ? ids : []
  } catch {
    return []
  }
}

function favouritesReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE':
      return state.includes(action.id)
        ? state.filter((id) => id !== action.id)
        : [...state, action.id]

    default:
      return state
  }
}

function HeartIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
      />
    </svg>
  )
}

function Gallery() {
  const { photos, loading, error } = useFetchPhotos()
  const [search, setSearch] = useState('')

  const [favourites, dispatch] = useReducer(
    favouritesReducer,
    undefined,
    getSavedFavourites
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites))
  }, [favourites])

  const handleSearch = useCallback((event) => {
    setSearch(event.target.value)
  }, [])

  const filteredPhotos = useMemo(() => {
    const query = search.trim().toLowerCase()

    return photos.filter((photo) =>
      photo.author.toLowerCase().includes(query)
    )
  }, [photos, search])

  function toggleFavourite(id) {
    dispatch({ type: 'TOGGLE', id })
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Photo Gallery
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Discover photography
          </h1>

          <p className="mt-3 text-slate-500">
            A collection of photographs from talented creators.
          </p>
        </header>

        <div className="mb-8">
          <label htmlFor="photo-search" className="sr-only">
            Search photos by author
          </label>

          <input
            id="photo-search"
            type="search"
            value={search}
            onChange={handleSearch}
            placeholder="Search by author name..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:max-w-md"
          />
        </div>

        {loading && (
          <div
            className="flex flex-col items-center justify-center py-20"
            role="status"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading photos...
            </p>
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="mb-5 text-sm text-slate-500" aria-live="polite">
              {filteredPhotos.length}{' '}
              {filteredPhotos.length === 1 ? 'photo' : 'photos'}
            </p>

            {filteredPhotos.length === 0 ? (
              <p className="rounded-xl bg-white p-10 text-center text-slate-500">
                No photos found for "{search}".
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredPhotos.map((photo) => {
                  const isFavourite = favourites.includes(photo.id)

                  return (
                    <article
                      key={photo.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <img
                        src={`https://picsum.photos/id/${photo.id}/600/400`}
                        alt={`Photograph by ${photo.author}`}
                        loading="lazy"
                        className="aspect-[3/2] w-full object-cover"
                      />

                      <div className="flex items-center justify-between gap-3 p-4">
                        <p
                          className="truncate font-medium text-slate-800"
                          title={photo.author}
                        >
                          {photo.author}
                        </p>

                        <button
                          type="button"
                          onClick={() => toggleFavourite(photo.id)}
                          aria-label={
                            isFavourite
                              ? `Remove ${photo.author} from favourites`
                              : `Add ${photo.author} to favourites`
                          }
                          aria-pressed={isFavourite}
                          className={`shrink-0 rounded-full p-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                            isFavourite
                              ? 'bg-rose-50 text-rose-600'
                              : 'text-slate-400 hover:bg-rose-50 hover:text-rose-500'
                          }`}
                        >
                          <HeartIcon filled={isFavourite} />
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default function App() {
  return <Gallery />
}
