'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { FaGraduationCap, FaUserTie, FaSearch, FaPlus } from 'react-icons/fa'
import Link from 'next/link'

const SearchPage: React.FC = () => {
  const [searchType, setSearchType] = useState<'school' | 'coach'>('coach')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [displayedResults, setDisplayedResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const resultsContainerRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)

  const handleSearchTypeChange = (type: 'school' | 'coach') => {
    setSearchType(type)
    setIsDropdownOpen(false)
    setSearchQuery('')
    setSearchResults([])
    setDisplayedResults([])
  }

  const handleSearch = useCallback(async () => {
    if (searchQuery.length === 0) {
      setSearchResults([])
      setDisplayedResults([])
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const endpoint = searchType === 'school' ? '/api/schools/search' : '/api/coaches/search'
      const response = await fetch(`${endpoint}?q=${searchQuery}&limit=5&offset=0`)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${searchType}s`)
      }
      const data = await response.json()
      console.log('API response:', data)
      if (Array.isArray(data.coaches) || Array.isArray(data.schools)) {
        const results = data.coaches || data.schools || []
        setSearchResults(results)
        setDisplayedResults(results)
      } else {
        setError(`No se encontraron ${searchType}s`)
      }
    } catch (error) {
      console.error(`Error fetching ${searchType}s:`, error)
      setError(`Failed to fetch ${searchType}s. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }, [searchType, searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch()
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  const loadMoreResults = useCallback(async () => {
    if (isLoading || displayedResults.length >= searchResults.length) return

    setIsLoading(true)
    try {
      const endpoint = searchType === 'school' ? '/api/schools/search' : '/api/coaches/search'
      const response = await fetch(`${endpoint}?q=${searchQuery}&limit=5&offset=${displayedResults.length}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch more ${searchType}s`)
      }
      const data = await response.json()
      console.log('Load more response:', data)
      setDisplayedResults(prev => [...prev, ...(data[`${searchType}s`] || [])])
    } catch (error) {
      console.error(`Error fetching more ${searchType}s:`, error)
      setError(`Failed to load more ${searchType}s. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }, [searchType, searchQuery, displayedResults.length, searchResults.length, isLoading])

  useEffect(() => {
    const handleScroll = () => {
      if (resultsContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = resultsContainerRef.current
        if (scrollTop + clientHeight >= scrollHeight - 20) {
          loadMoreResults()
        }
      }
    }

    const resultsContainer = resultsContainerRef.current
    if (resultsContainer) {
      resultsContainer.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (resultsContainer) {
        resultsContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [loadMoreResults])

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Find Your {searchType === 'school' ? 'School' : 'Coach'}</h1>
      
      <div className="relative bg-indigo-900 bg-opacity-50 rounded-lg p-6 shadow-lg">
        <div className="flex items-center border-b border-gray-700 pb-2 relative">
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={toggleDropdown}
              className="flex items-center bg-indigo-800 rounded-l-full px-4 py-2 text-gray-300 hover:bg-indigo-700 transition duration-300"
            >
              {searchType === 'school' ? (
                <>
                  <FaGraduationCap className="mr-2" />
                  Schools
                </>
              ) : (
                <>
                  <FaUserTie className="mr-2" />
                  Coaches
                </>
              )}
              <span className="ml-2">▼</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-indigo-800 rounded-md shadow-lg overflow-hidden z-10">
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-indigo-700 transition duration-300 flex items-center"
                  onClick={() => handleSearchTypeChange('school')}
                >
                  <FaGraduationCap className="mr-2" />
                  Schools
                </button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-indigo-700 transition duration-300 flex items-center"
                  onClick={() => handleSearchTypeChange('coach')}
                >
                  <FaUserTie className="mr-2" />
                  Coaches
                </button>
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder={`Search for a ${searchType}`}
            className="flex-grow bg-transparent border-none focus:outline-none text-white placeholder-gray-400 px-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-r-full transition duration-300"
            onClick={handleSearch}
          >
            <FaSearch />
          </button>
        </div>
        
        {error && <p className="text-red-500 mt-2">{error}</p>}
        
        {isLoading && <p className="text-white mt-4">Loading...</p>}
        
        {!isLoading && displayedResults.length > 0 && (
          <div 
            ref={resultsContainerRef}
            className="mt-6 space-y-4 max-h-96 overflow-y-auto"
          >
            {displayedResults.map((result) => (
              <Link key={result.coachId || result.schoolId} href={`/pages/${searchType}/${result.coachId || result.schoolId}`}>
                <div className="bg-indigo-800 bg-opacity-50 p-4 rounded-lg shadow cursor-pointer hover:bg-indigo-700 transition duration-300">
                  <h2 className="text-xl font-semibold text-white">
                    {searchType === 'coach' 
                      ? `${result.coachFirstName} ${result.coachLastName}`
                      : result.name
                    }
                  </h2>
                  {searchType === 'coach' && (
                    <p className="text-gray-300">{`School: ${result.schoolId}, Sport: ${result.sportId}`}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && searchQuery && searchResults.length === 0 && (
          <div className="mt-4">
            <p className="text-white">No results found.</p>
            <Link href={`/pages/add-${searchType}`} className="text-yellow-400 hover:text-yellow-300 mt-2 inline-block">
              <FaPlus className="inline mr-2" />
              Can&apos;t find your {searchType}? Add a new one
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage