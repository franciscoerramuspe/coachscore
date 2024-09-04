'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import StarRating from '../../../components/StarRating/page'
import { FaGraduationCap, FaUserTie, FaSearch } from 'react-icons/fa'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
  </div>
)

const RatePage: React.FC = () => {
  const [searchType, setSearchType] = useState<'school' | 'coach'>('school')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [displayedResults, setDisplayedResults] = useState<any[]>([])
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedCoach, setSelectedCoach] = useState('')
  const [rating, setRating] = useState(1)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { userId } = useAuth()
  const resultsContainerRef = useRef<HTMLDivElement>(null)

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value as 'school' | 'coach')
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
      if (Array.isArray(data.coaches) || Array.isArray(data.schools)) {
        const results = data.coaches || data.schools || []
        setSearchResults(results)
        setDisplayedResults(results)
      } else {
        setError(`No ${searchType}s found`)
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
    }, 300)

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
      <Card className="bg-indigo-900 bg-opacity-50">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center text-yellow-400">Rate a Coach</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Select onValueChange={handleSearchTypeChange} defaultValue={searchType}>
              <SelectTrigger className="w-[180px] bg-indigo-800 text-white border-none">
                <SelectValue placeholder="Select search type" />
              </SelectTrigger>
              <SelectContent className="bg-indigo-800 text-white border-none">
                <SelectItem value="school">
                  <div className="flex items-center">
                    <FaGraduationCap className="mr-2" />
                    Schools
                  </div>
                </SelectItem>
                <SelectItem value="coach">
                  <div className="flex items-center">
                    <FaUserTie className="mr-2" />
                    Coaches
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-grow relative">
              <Input
                type="text"
                placeholder={`Search for a ${searchType}`}
                className="w-full bg-transparent border-none focus:outline-none text-white placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                onClick={handleSearch}
                className="absolute right-0 top-0 bottom-0 bg-yellow-500 hover:bg-yellow-600 text-black"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FaSearch />}
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
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
          )}

          {selectedCoach && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Rating
                </label>
                <StarRating rating={rating} onRatingChange={setRating} />
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
              
              <Button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RatePage