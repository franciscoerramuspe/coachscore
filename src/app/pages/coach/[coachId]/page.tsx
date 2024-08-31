'use client'
import { useEffect, useState } from 'react'
import StarRating from '@/components/StarRating/page'

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

  useEffect(() => {
    const fetchCoachDetails = async () => {
      try {
        const response = await fetch(`/api/coaches/${params.coachId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch coach details')
        }
        const data = await response.json()
        setCoach(data)
      } catch (err) {
        setError('An error occurred while fetching coach details')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoachDetails()
  }, [params.coachId])

  if (isLoading) return <div className="text-center text-white">Loading...</div>
  if (error) return <div className="text-center text-red-500">{error}</div>
  if (!coach) return <div className="text-center text-white">Coach not found</div>

  const averageRating = coach.ratings.length > 0
    ? coach.ratings.reduce((sum, review) => sum + review.rating, 0) / coach.ratings.length
    : 0

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">{`${coach.coachFirstName} ${coach.coachLastName}`}</h1>
      <div className="bg-indigo-900 bg-opacity-50 rounded-lg p-6 shadow-lg mb-8">
        <p className="text-white mb-2"><span className="font-bold">School:</span> {coach.schoolId}</p>
        <p className="text-white mb-4"><span className="font-bold">Sport:</span> {coach.sportId}</p>
        <div className="flex items-center mb-2">
          <StarRating initialRating={averageRating} readOnly />
          <span className="text-white ml-2">({averageRating.toFixed(1)})</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">Reviews</h2>
      {coach.ratings.length === 0 ? (
        <p className="text-gray-300">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {coach.ratings.map((review) => (
            <div key={review.reviewId} className="bg-indigo-800 bg-opacity-50 p-4 rounded-lg shadow">
              <div className="flex items-center mb-2">
                <StarRating initialRating={review.rating} readOnly />
                <span className="text-white ml-2">({review.rating})</span>
              </div>
              <p className="text-white">{review.comment}</p>
              <p className="text-gray-400 text-sm mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}