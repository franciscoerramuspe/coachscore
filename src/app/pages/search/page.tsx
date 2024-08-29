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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-r-full transition duration-300">
            Search
          </button>
        </div>
        
        {/* Resultados de búsqueda */}
        <div className="mt-6 space-y-4">
          {searchResults.map((result) => (
            <div key={result.id} className="bg-indigo-800 bg-opacity-50 p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-white">{result.name}</h2>
              {/* Añade más detalles según sea necesario */}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchPage