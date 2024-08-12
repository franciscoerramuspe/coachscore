'use client'
import Head from 'next/head'
import { useState } from 'react'

const AddCoachPage: React.FC = () => {
  const [coachName, setCoachName] = useState('')
  const [school, setSchool] = useState('')
  const [sport, setSport] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement coach addition logic here
    console.log('Adding coach:', { coachName, school, sport })
    // Reset form or redirect user after submission
  }

  return (
    <>
      <Head>
        <title>Add a Coach | Rate My Coach</title>
        <meta name="description" content="Add a new coach to Rate My Coach" />
      </Head>

      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Add a Coach</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="coachName" className="block text-sm font-medium text-gray-300 mb-1">
              Coach Name
            </label>
            <input
              type="text"
              id="coachName"
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              className="w-full px-4 py-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label htmlFor="school" className="block text-sm font-medium text-gray-300 mb-1">
              School
            </label>
            <input
              type="text"
              id="school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-4 py-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label htmlFor="sport" className="block text-sm font-medium text-gray-300 mb-1">
              Sport
            </label>
            <input
              type="text"
              id="sport"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full px-4 py-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
          >
            Add Coach
          </button>
        </form>
      </div>
    </>
  )
}

export default AddCoachPage