'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import StarRating from '../../../components/StarRating/page'
import { FaUserTie, FaSearch, FaPlus } from 'react-icons/fa'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { CheckCircledIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

interface Coach {
  coachId: string;
  coachFirstName: string;
  coachLastName: string;
  schoolId: string;
  schoolName: string;
  sportId: string;
  sportName: string;
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
  </div>
)

const RatePage: React.FC = () => {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Coach[]>([])
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

  const handleSearch = useCallback(async () => {
    if (searchQuery.length === 0) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/coaches/search?q=${encodeURIComponent(searchQuery)}&limit=5&offset=0`)
      if (!response.ok) {
        throw new Error('Failed to fetch coaches')
      }
      const data = await response.json()
      if (Array.isArray(data.coachesWithNames)) {
        setSearchResults(data.coachesWithNames)
      } else {
        setSearchResults([])
        setError('No coaches found')
      }
    } catch (error) {
      console.error('Error fetching coaches:', error)
      setError('Failed to fetch coaches. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery])

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
      toast({
        title: "Review submitted",
        description: "Your review has been successfully submitted.",
        variant: "default",
      })
      router.push(`/pages/coach/${selectedCoach}`)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
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
            <div className="flex-grow relative">
              <Input
                type="text"
                placeholder="Search for a coach"
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
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Link href="/pages/add-coach" passHref>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <FaPlus className="mr-2" /> Add a New Coach
                </Button>
              </Link>
            </div>
          ) : (
            <div ref={resultsContainerRef} className="mt-4 space-y-4 max-h-96 overflow-y-auto">
              {searchResults.map((coach) => (
                <div 
                  key={coach.coachId}
                  className={`bg-indigo-800 bg-opacity-50 p-4 rounded-lg shadow cursor-pointer transition duration-300 ${
                    selectedCoach === coach.coachId ? 'border-2 border-yellow-400' : 'hover:bg-indigo-700'
                  }`}
                  onClick={() => setSelectedCoach(coach.coachId)}
                >
                  <h2 className="text-xl font-semibold text-white">
                    {`${coach.coachFirstName} ${coach.coachLastName}`}
                  </h2>
                  <p className="text-gray-300">
                    School: {coach.schoolName || 'Unknown'}, 
                    Sport: {coach.sportName || 'Unknown'}
                  </p>
                  {selectedCoach === coach.coachId && (
                    <div className="mt-2 text-yellow-400 flex items-center">
                      <CheckCircledIcon className="mr-2" />
                      Selected for review
                    </div>
                  )}
                </div>
              ))}
              {searchResults.length === 0 && searchQuery.length > 0 && !error && (
                <div className="text-center">
                  <p className="text-white mb-4">No coaches found. Would you like to add a new coach?</p>
                  <Link href="/pages/add-coach" passHref>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      <FaPlus className="mr-2" /> Add a New Coach
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {selectedCoach && (
            <div className="mt-8 mb-4 p-4 bg-indigo-700 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Selected Coach:</h3>
              {searchResults.find(coach => coach.coachId === selectedCoach) && (
                <>
                  <p className="text-lg text-yellow-400">
                    {searchResults.find(coach => coach.coachId === selectedCoach)?.coachFirstName} {searchResults.find(coach => coach.coachId === selectedCoach)?.coachLastName}
                  </p>
                  <p className="text-sm text-gray-300">
                    School: {searchResults.find(coach => coach.coachId === selectedCoach)?.schoolName}, 
                    Sport: {searchResults.find(coach => coach.coachId === selectedCoach)?.sportName}
                  </p>
                </>
              )}
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