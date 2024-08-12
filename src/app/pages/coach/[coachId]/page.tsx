'use client'
import { useEffect, useState } from 'react'
import { coaches, schools, sports } from '../../search/mockData'
import AverageRatingDisplay from '../../../../components/AverageRatingDisplay/page'
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'

const mockReviews = [
  { id: 1, rating: 4.5, comment: "Great coach, really helped improve my technique." },
  { id: 2, rating: 5, comment: "Amazing mentor, both on and off the field." },
  { id: 3, rating: 3.5, comment: "Good knowledge, but could improve communication." },
];

interface CoachPageProps {
  params: {
    coachId: string
  }
}

const CoachPage: React.FC<CoachPageProps> = ({ params }) => {
  const { coachId } = params
  const [coach, setCoach] = useState<any | null>(null)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    if (coachId) {
      const coachData = coaches.find(c => c.id === Number(coachId))
      if (coachData) {
        const school = schools.find(s => s.id === coachData.schoolId)
        const sport = sports.find(s => s.id === coachData.sportId)
        setCoach({ ...coachData, schoolName: school?.name, sportName: sport?.name })
        
        // Calculate average rating
        const avgRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length
        setAverageRating(avgRating)
      }
    }
  }, [coachId])

  if (!coach) {
    return <div className="text-center mt-8">Loading...</div>
  }

  const DisplayStars: React.FC<{ rating: number }> = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
  
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return <FaStar key={index} className="text-yellow-400" />;
          } else if (index === fullStars && hasHalfStar) {
            return <FaStarHalfAlt key={index} className="text-yellow-400" />;
          } else {
            return <FaRegStar key={index} className="text-yellow-400" />;
          }
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 relative">
      <div className="absolute top-4 right-4">
        <AverageRatingDisplay rating={averageRating} />
      </div>
      <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">{coach.name}</h1>
      <div className="mb-8 text-center text-gray-300">
        <p>{coach.schoolName}</p>
        <p>{coach.sportName}</p>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-white">Reviews</h2>
      <div className="space-y-4">
        {mockReviews.map(review => (
          <div key={review.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <DisplayStars rating={review.rating} />
              <span className="ml-2 text-yellow-400">{review.rating.toFixed(1)}</span>
            </div>
            <p className="text-white">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CoachPage