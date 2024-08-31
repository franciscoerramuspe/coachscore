'use client'
import Head from 'next/head'
import { useState, useEffect, useCallback, useRef } from 'react'
import StarRating from '../../../components/StarRating/page'
import { schools, sports, coaches } from './mockData'
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
    if (searchType === 'school') {
      try {
        const response = await fetch(`/api/schools/search?q=${searchQuery}&limit=5&offset=0`)
        if (!response.ok) {
          throw new Error('Failed to fetch schools')
        }
        const data = await response.json()
        setSearchResults(data.schools)
        setDisplayedResults(data.schools)
      } catch (error) {
        console.error('Error fetching schools:', error)
      }
    } else {
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
    }
  }, [searchType, searchQuery])

  useEffect(() => {
    if (searchQuery.length > 0) {
      handleSearch()
    } else {
      setSearchResults([])
      setDisplayedResults([])
    }
  }, [searchQuery, handleSearch])

  const loadMoreResults = useCallback(async () => {
    if (searchType === 'school') {
      try {
        const response = await fetch(`/api/schools/search?q=${searchQuery}&limit=5&offset=${displayedResults.length}`)
        if (!response.ok) {
          throw new Error('Failed to fetch more schools')
        }
        const data = await response.json()
        setDisplayedResults(prev => [...prev, ...data.schools])
      } catch (error) {
        console.error('Error fetching more schools:', error)
      }
    } else {
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
    }
  }, [searchType, searchQuery, displayedResults.length])

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

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
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
                <button 
                  onClick={loadMoreResults}
                  className="w-full text-center text-yellow-400 hover:text-yellow-300 transition duration-300"
                >
                  Load More
                </button>
              )}
            </div>
          </div>

          {selectedCoach && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
        </form>
      </div>
    </>
  )
}

export default RatePage