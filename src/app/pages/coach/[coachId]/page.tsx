'use client'
import { useEffect, useState, useCallback } from 'react'
import StarRating from '@/components/StarRating/page'
import { useAuth } from '@clerk/nextjs'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircledIcon } from "@radix-ui/react-icons"

interface Review {
  reviewId: string
  rating: number
  comment: string
  createdAt: string
}

interface Coach {
  coachId: string
  coachFirstName: string
  coachLastName: string
  schoolId: string
  sportId: string
  ratings: Review[]
}

export default function CoachPage({ params }: { params: { coachId: string } }) {
  const [coach, setCoach] = useState<Coach | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(1) // Initialize rating to 1
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const { userId } = useAuth()
  const [showAlert, setShowAlert] = useState(false)

  const fetchCoachDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/coaches/${params.coachId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch coach details')
      }
      const data = await response.json()
      // Sort ratings by createdAt in descending order (newest first)
      data.ratings.sort((a: Review, b: Review) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setCoach(data)
    } catch (err) {
      setError('An error occurred while fetching coach details')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [params.coachId])

  useEffect(() => {
    fetchCoachDetails()
  }, [fetchCoachDetails])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    // Client-side validation
    if (!userId) {
      setSubmitError('You have to be logged in to submit a review')
      return
    }
    if (rating < 1) {
      setSubmitError('Please provide a rating of at least 1 star')
      return
    }
    if (!comment.trim()) {
      setSubmitError('Please provide a comment for your review')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coachId: params.coachId,
          rating,
          comment,
          reviewerId: userId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.errors) {
          // Handle specific validation errors from the server
          const errorMessages = errorData.errors.join('. ')
          throw new Error(errorMessages)
        } else {
          throw new Error(errorData.message || 'Error submitting review')
        }
      }

      setRating(1)
      setComment('')
      setShowAlert(true)
      await fetchCoachDetails()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred while submitting the review')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false)
      }, 5000) // Hide after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [showAlert])

  if (isLoading) return <div className="text-center text-white">Loading...</div>
  if (error) return <div className="text-center text-red-500">{error}</div>
  if (!coach) return <div className="text-center text-white">Coach not found</div>

  const averageRating = coach.ratings.length > 0
    ? coach.ratings.reduce((sum, review) => sum + review.rating, 0) / coach.ratings.length
    : 0

    return (
      <div className="max-w-4xl mx-auto py-12 px-4 bg-indigo-950 !important">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">{`${coach.coachFirstName} ${coach.coachLastName}`}</h1>
        <div className="bg-indigo-900 bg-opacity-50 rounded-lg p-6 shadow-lg mb-8">
          <p className="text-white mb-2"><span className="font-bold">School:</span> {coach.schoolId}</p>
          <p className="text-white mb-4"><span className="font-bold">Sport:</span> {coach.sportId}</p>
          <div className="flex items-center justify-between bg-indigo-800 bg-opacity-50 rounded-lg p-4">
            <span className="text-lg font-semibold text-yellow-400">Average Rating:</span>
            <div className="flex items-center">
              <StarRating rating={averageRating} readOnly={true} />
              <span className="text-white ml-2 text-lg font-bold">
                {averageRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-white">Reviews</h2>
        {coach.ratings.length === 0 ? (
          <p className="text-gray-300">No reviews yet.</p>
        ) : (
          <div className={`space-y-4 ${coach.ratings.length > 5 ? 'max-h-[600px] overflow-y-auto pr-4 scrollbar-thin' : ''}`}>
            {coach.ratings.map((review) => (
              <div key={review.reviewId} className="bg-indigo-800 bg-opacity-50 p-4 rounded-lg shadow">
                <div className="flex items-center mb-2">
                  <StarRating rating={review.rating} readOnly={true} />
                  <span className="text-white ml-2">({review.rating})</span>
                </div>
                <p className="text-white">{review.comment}</p>
                <p className="text-gray-400 text-sm mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 bg-indigo-900 bg-opacity-50 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Add a Review</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="rating" className="block text-yellow-400 mb-2 font-semibold">Rating</label>
              <StarRating 
                rating={rating} 
                onRatingChange={setRating} 
              />
            </div>
            <div>
              <label htmlFor="comment" className="block text-yellow-400 mb-2 font-semibold">Comment</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 bg-indigo-800 text-white border border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                rows={4}
              ></textarea>
            </div>
            {submitError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{submitError}</span>
              </div>
            )}
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
        {showAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-indigo-900 rounded-lg p-6 max-w-sm mx-auto">
              <Alert>
                <CheckCircledIcon className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Your review has been submitted successfully.</AlertDescription>
              </Alert>
              <button
                onClick={() => setShowAlert(false)}
                className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    )
}