'use client'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import StarRating from '../../../components/StarRating/page'
import AddCoachPrompt from '../../../components/AddCoachPrompt/page'
import { schools, sports, coaches } from './mockData'

const RatePage: React.FC = () => {
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedSport, setSelectedSport] = useState('')
  const [selectedCoach, setSelectedCoach] = useState('')
  const [filteredSports, setFilteredSports] = useState(sports)
  const [filteredCoaches, setFilteredCoaches] = useState(coaches)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (selectedSchool) {
      setFilteredSports(sports)
      setFilteredCoaches(coaches.filter(coach => coach.schoolId.toString() === selectedSchool))
      setSelectedSport('')
      setSelectedCoach('')
    }
  }, [selectedSchool])

  useEffect(() => {
    if (selectedSport) {
      setFilteredCoaches(prevCoaches => 
        prevCoaches.filter(coach => coach.sportId.toString() === selectedSport)
      )
      setSelectedCoach('')
    }
  }, [selectedSport])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement rating submission logic here
    console.log('Submitting rating:', { selectedSchool, selectedSport, selectedCoach, rating, comment })
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setSelectedSchool('')
      setSelectedSport('')
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
          <div>
            <label htmlFor="school" className="block text-sm font-medium text-gray-300 mb-1">
              Select School
            </label>
            <select
              id="school"
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full px-4 py-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              <option value="">Select a school</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>{school.name}</option>
              ))}
            </select>
          </div>

          {selectedSchool && (
            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-gray-300 mb-1">
                Select Sport
              </label>
              <select
                id="sport"
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full px-4 py-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select a sport</option>
                {filteredSports.map(sport => (
                  <option key={sport.id} value={sport.id}>{sport.name}</option>
                ))}
              </select>
            </div>
          )}

          {selectedSport && (
            <div>
              <label htmlFor="coach" className="block text-sm font-medium text-gray-300 mb-1">
                Select Coach
              </label>
              <select
                id="coach"
                value={selectedCoach}
                onChange={(e) => setSelectedCoach(e.target.value)}
                className="w-full px-4 py-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select a coach</option>
                {filteredCoaches.map(coach => (
                  <option key={coach.id} value={coach.id}>{coach.name}</option>
                ))}
              </select>
              {filteredCoaches.length === 0 && <AddCoachPrompt />}
            </div>
          )}

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