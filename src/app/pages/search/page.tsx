'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { FaGraduationCap, FaUserTie, FaSearch } from 'react-icons/fa'
import { schools, coaches } from './mockData'

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

  const handleSearch = useCallback(() => {
    const data = searchType === 'school' ? schools : coaches
    const results = data.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setSearchResults(results)
    setDisplayedResults(results.slice(0, 5))
  }, [searchType, searchQuery])

  useEffect(() => {
    if (searchQuery.length > 0) {
      handleSearch()
    } else {
      setSearchResults([])
      setDisplayedResults([])
    }
  }, [searchQuery, handleSearch])

  const loadMoreResults = useCallback(() => {
    const currentLength = displayedResults.length
    const nextResults = searchResults.slice(currentLength, currentLength + 5)
    setDisplayedResults(prev => [...prev, ...nextResults])
  }, [displayedResults, searchResults])

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
        <div className="flex items-center border-b border-gray-700 pb-2">
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
        
        {/* Resultados de búsqueda */}
        <div 
          ref={resultsContainerRef}
          className="mt-6 space-y-4 max-h-96 overflow-y-auto"
        >
          {displayedResults.map((result) => (
            <div key={result.id} className="bg-indigo-800 bg-opacity-50 p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-white">{result.name}</h2>
            </div>
          ))}
          {displayedResults.length < searchResults.length && (
            <p className="text-center text-gray-400">Scroll para ver más resultados</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchPage