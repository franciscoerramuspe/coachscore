'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import StarRating from '../../../components/StarRating/page'
import { FaGraduationCap, FaUserTie, FaSearch, FaPlus } from 'react-icons/fa'
import Link from 'next/link'
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
  const router = useRouter()
  const { userId } = useAuth()
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

  const handleSearch = useCallback(async () => {
    if (searchQuery.length > 0) {
      try {
        setIsLoading(true);
        const endpoint = searchType === 'school' ? '/api/schools/search' : '/api/coaches/search';
        const response = await fetch(`${endpoint}?q=${searchQuery}&limit=5&offset=0`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API response:', data);
        if (Array.isArray(data.schools) || Array.isArray(data.coaches)) {
          const results = data.schools || data.coaches || [];
          setSearchResults(results);
          setDisplayedResults(results);
        } else {
          console.error('Unexpected API response format:', data);
          setSearchResults([]);
          setDisplayedResults([]);
        }
      } catch (error) {
        console.error(`Error fetching ${searchType}s:`, error);
        setSearchResults([]);
        setDisplayedResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
      setDisplayedResults([]);
    }
  }, [searchType, searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      if (resultsContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = resultsContainerRef.current
        if (scrollTop + clientHeight >= scrollHeight - 20) {
          // Load more results when scrolled to bottom
          // Implement loadMoreResults function if needed
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
  }, [])

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
                  onClick={(e) => handleSearchTypeChange(e, 'school')}
                >
                  <FaGraduationCap className="mr-2" /> Schools
                </button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-indigo-700 transition duration-300 flex items-center"
                  onClick={(e) => handleSearchTypeChange(e, 'coach')}
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
            onClick={() => handleSearch()}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-r-full transition duration-300"
          >
            <FaSearch />
          </button>
        </div>
        
        {isLoading && <p className="text-white">Loading...</p>}
        
        <div ref={resultsContainerRef} className="mt-4 space-y-4 max-h-96 overflow-y-auto">
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