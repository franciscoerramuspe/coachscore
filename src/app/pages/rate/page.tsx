'use client'
import Head from 'next/head'
import { useState, useEffect, useCallback, useRef } from 'react'
import StarRating from '../../../components/StarRating/page'
import { schools, sports, coaches } from './mockData'
import { FaGraduationCap, FaUserTie, FaSearch, FaPlus } from 'react-icons/fa'
import Link from 'next/link'

const RatePage: React.FC = () => {
  const [searchType, setSearchType] = useState<'school' | 'coach'>('school')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [displayedResults, setDisplayedResults] = useState<any[]>([])
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedCoach, setSelectedCoach] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const resultsContainerRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleSearchTypeChange = (e: React.MouseEvent, type: 'school' | 'coach') => {
    e.preventDefault()
    setSearchType(type)
    setIsDropdownOpen(false)
    setSearchQuery('')
    setSearchResults([])
    setDisplayedResults([])
    setSelectedSchool('')
    setSelectedCoach('')
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement rating submission logic here
    console.log('Submitting rating:', { selectedSchool, selectedCoach, rating, comment })
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setSelectedSchool('')
      setSelectedCoach('')
      setRating(0)
      setComment('')
    }, 3000)
  }

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="text-6xl mb-4">
          <span className="text-yellow-400">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Thank you for your rating!</h2>
        <p className="text-gray-300">Your feedback has been successfully submitted.</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Rate a Coach | Rate My Coach</title>
        <meta name="description" content="Rate and review college coaches" />
      </Head>

      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Rate a Coach</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative bg-indigo-900 bg-opacity-50 rounded-lg p-6 shadow-lg">
            <div className="flex items-center border-b border-gray-700 pb-2 relative">
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={toggleDropdown}
                  type="button"
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
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-indigo-700 transition duration-300 flex items-center"
                      onClick={(e) => handleSearchTypeChange(e, 'school')}
                    >
                      <FaGraduationCap className="mr-2" />
                      Schools
                    </button>
                    <button 
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-indigo-700 transition duration-300 flex items-center"
                      onClick={(e) => handleSearchTypeChange(e, 'coach')}
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
                type="button"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-r-full transition duration-300"
                onClick={handleSearch}
              >
                <FaSearch />
              </button>
              
              {searchQuery && searchResults.length === 0 && (
                <Link href={`/add-${searchType}`} className="absolute right-0 bottom-0 transform translate-y-full mt-2">
                  <button 
                    type="button"
                    className="text-yellow-400 hover:text-yellow-300 font-bold py-2 px-4 rounded-full transition duration-300 flex items-center"
                  >
                    <FaPlus className="mr-2" />
                    Can&apos;t find your {searchType}?
                  </button>
                </Link>
              )}
            </div>
            
            <div 
              ref={resultsContainerRef}
              className="mt-6 space-y-4 max-h-96 overflow-y-auto"
            >
              {displayedResults.map((result) => (
                <div 
                  key={result.id} 
                  className="bg-indigo-800 bg-opacity-50 p-4 rounded-lg shadow cursor-pointer hover:bg-indigo-700 transition duration-300"
                  onClick={() => {
                    if (searchType === 'school') {
                      setSelectedSchool(result.id)
                      setSearchType('coach')
                      setSearchQuery('')
                    } else {
                      setSelectedCoach(result.id)
                    }
                  }}
                >
                  <h2 className="text-xl font-semibold text-white">{result.name}</h2>
                </div>
              ))}
              {displayedResults.length < searchResults.length && (
                <p className="text-center text-gray-400">Scroll para ver más resultados</p>
              )}
            </div>
          </div>

          {selectedCoach && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Rating
                </label>
                <StarRating onRatingChange={handleRatingChange} initialRating={rating} />
              </div>
              
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">
                  Comment
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
              >
                Submit Rating
              </button>
            </>
          )}
        </form>
      </div>
    </>
  )
}

export default RatePage