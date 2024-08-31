'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { FaGraduationCap, FaUserTie, FaSearch, FaPlus } from 'react-icons/fa'
import { schools, coaches } from './mockData'
import Link from 'next/link'

const SearchPage: React.FC = () => {
  const [searchType, setSearchType] = useState<'school' | 'coach'>('school')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [displayedResults, setDisplayedResults] = useState<any[]>([])
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
    if (searchQuery.length > 0) {
      try {
        const response = await fetch(`/api/coaches/search?q=${searchQuery}&limit=5&offset=0`)
        if (!response.ok) {
          throw new Error('Failed to fetch coaches')
        }
        const data = await response.json()
        setSearchResults(data.coaches)
        setDisplayedResults(data.coaches)
      } catch (error) {
        console.error('Error fetching coaches:', error)
      }
    } else {
      setSearchResults([])
      setDisplayedResults([])
    }
  }, [searchQuery])

  useEffect(() => {
    handleSearch()
  }, [searchQuery, handleSearch])

  const loadMoreResults = useCallback(async () => {
    try {
      const response = await fetch(`/api/coaches/search?q=${searchQuery}&limit=5&offset=${displayedResults.length}`)
      if (!response.ok) {
        throw new Error('Failed to fetch more coaches')
      }
      const data = await response.json()
      setDisplayedResults(prev => [...prev, ...data.coaches])
    } catch (error) {
      console.error('Error fetching more coaches:', error)
    }
  }, [searchQuery, displayedResults.length])

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
          
          {/* Nuevo botón condicional */}
          {searchQuery && searchResults.length === 0 && (
            <Link href={`/add-${searchType}`} className="absolute right-0 bottom-0 transform translate-y-full mt-2">
              <button className="text-yellow-400 hover:text-yellow-300 font-bold py-2 px-4 rounded-full transition duration-300 flex items-center">
                <FaPlus className="mr-2" />
                Can&apos;t find your {searchType}?
              </button>
            </Link>
          )}
        </div>
        
        {/* Resultados de búsqueda */}
        <div 
          ref={resultsContainerRef}
          className="mt-6 space-y-4 max-h-96 overflow-y-auto"
        >
          {displayedResults.map((coach) => (
            <Link key={coach.coachId} href={`/pages/coach/${coach.coachId}`}>
              <div className="bg-indigo-800 bg-opacity-50 p-4 rounded-lg shadow cursor-pointer hover:bg-indigo-700 transition duration-300">
                <h2 className="text-xl font-semibold text-white">{`${coach.coachFirstName} ${coach.coachLastName}`}</h2>
                <p className="text-gray-300">{`School: ${coach.schoolId}, Sport: ${coach.sportId}`}</p>
              </div>
            </Link>
          ))}
          {displayedResults.length < searchResults.length && (
            <button 
              onClick={loadMoreResults}
              className="w-full text-center text-yellow-400 hover:text-yellow-300 transition duration-300"
            >
              Load More
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchPage