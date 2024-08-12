'use client'
import { useState, useEffect, useRef } from 'react'
import { FaGraduationCap, FaUserTie } from 'react-icons/fa'
import { schools, coaches, sports } from './mockData'

const SearchPage: React.FC = () => {
    const [searchType, setSearchType] = useState<'school' | 'coach'>('school')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
  
    useEffect(() => {
      if (searchQuery.length > 0) {
        if (searchType === 'school') {
          const filteredSchools = schools.filter(school => 
            school.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          setSearchResults(filteredSchools)
        } else {
          const filteredCoaches = coaches.filter(coach => 
            coach.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(coach => ({
            ...coach,
            schoolName: schools.find(school => school.id === coach.schoolId)?.name,
            sportName: sports.find(sport => sport.id === coach.sportId)?.name
          }))
          setSearchResults(filteredCoaches)
        }
      } else {
        setSearchResults([])
      }
    }, [searchQuery, searchType])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)

  const handleSearchTypeChange = (type: 'school' | 'coach') => {
    setSearchType(type)
    setIsDropdownOpen(false)
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Find Your {searchType === 'school' ? 'School' : 'Coach'}</h1>
      
      <div className="relative">
        <div className="flex items-center border-b border-gray-700 pb-2">
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={toggleDropdown}
              className="flex items-center bg-gray-800 rounded-l-full px-4 py-2 text-gray-300 hover:bg-gray-700 transition duration-300"
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
              <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 rounded-md shadow-lg overflow-hidden z-10">
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 transition duration-300 flex items-center"
                  onClick={() => handleSearchTypeChange('school')}
                >
                  <FaGraduationCap className="mr-2" />
                  Schools
                </button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 transition duration-300 flex items-center"
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
            placeholder={`Search for ${searchType === 'school' ? 'a school' : 'a coach'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow bg-transparent text-white pl-4 focus:outline-none"
          />
        </div>
      </div>
        {searchResults.length > 0 && (
            <ul className="mt-4 bg-gray-800 rounded-lg overflow-hidden">
                {searchResults.map((result) => (
                <li key={result.id} className="px-4 py-3 hover:bg-gray-700 transition duration-300">
                    {searchType === 'school' ? (
                    <a href="#" className="text-white">{result.name}</a>
                    ) : (
                    <a href={`/pages/coach/${result.id}`} className="text-white block">
                        <span className="font-semibold">{result.name}</span>
                        <span className="text-gray-400 ml-2">
                        {result.schoolName} - {result.sportName}
                        </span>
                    </a>
                    )}
                </li>
                ))}
            </ul>
        )}

        {searchQuery && searchResults.length === 0 && (
            <p className="mt-4 text-gray-400 text-center">No results found</p>
        )}
    </div>
  )
}

export default SearchPage