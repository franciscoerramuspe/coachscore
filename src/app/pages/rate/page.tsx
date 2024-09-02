'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import StarRating from '../../../components/StarRating/page'
import { FaGraduationCap, FaUserTie, FaSearch } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { userId } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const resultsContainerRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)

  const handleSearchTypeChange = (type: 'school' | 'coach') => {
    setSearchType(type)
    setIsDropdownOpen(false)
    setSearchQuery('')
    setSearchResults([])
    setDisplayedResults([])
    setSelectedSchool('')
    setSelectedCoach('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      setSubmitError('You must be logged in to submit a review')
      return
    }
    if (!selectedCoach || rating === 0) {
      setSubmitError('Please select a coach and provide a rating')
      return
    }
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coachId: selectedCoach,
          rating,
          comment,
          reviewerId: userId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      const data = await response.json()
      router.push(`/pages/coach/${selectedCoach}`)
    } catch (err) {
      setSubmitError('An error occurred while submitting the review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Rate a Coach</h1>
      
      <div className="bg-indigo-900 bg-opacity-50 rounded-lg p-6 shadow-lg">
        <div className="flex items-center border-b border-gray-700 pb-2 mb-4">
          <div className="relative">
            <button 
              onClick={toggleDropdown}
              className="flex items-center bg-indigo-800 rounded-l-full px-4 py-2 text-gray-300 hover:bg-indigo-700 transition duration-300"
            >
              {searchType === 'school' ? <FaGraduationCap className="mr-2" /> : <FaUserTie className="mr-2" />}
              {searchType === 'school' ? 'Schools' : 'Coaches'}
              <span className="ml-2">▼</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-indigo-800 rounded-md shadow-lg overflow-hidden z-10">
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-indigo-700 transition duration-300 flex items-center"
                  onClick={() => handleSearchTypeChange('school')}
                >
                  <FaGraduationCap className="mr-2" /> Schools
                </button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-indigo-700 transition duration-300 flex items-center"
                  onClick={() => handleSearchTypeChange('coach')}
                >
                  <FaUserTie className="mr-2" /> Coaches
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
            onClick={handleSearch}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-r-full transition duration-300"
          >
            <FaSearch />
          </button>
        </div>
        
        {isLoading && <p className="text-white">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        <div ref={resultsContainerRef} className="mt-4 space-y-4 max-h-96 overflow-y-auto">
          {displayedResults.map((result) => (
            <div 
              key={result.id || result.coachId || result.schoolId} 
              className="bg-indigo-800 bg-opacity-50 p-4 rounded-lg shadow cursor-pointer hover:bg-indigo-700 transition duration-300"
              onClick={() => {
                if (searchType === 'school') {
                  setSelectedSchool(result.id || result.schoolId)
                  setSearchType('coach')
                  setSearchQuery('')
                } else {
                  setSelectedCoach(result.id || result.coachId)
                }
              }}
            >
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
          ))}
        </div>
      </div>

      {selectedCoach && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Rating
            </label>
            <StarRating onRatingChange={setRating} initialRating={rating} />
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
          
          {submitError && <p className="text-red-500">{submitError}</p>}
          
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
    </div>
  )
}

export default RatePage