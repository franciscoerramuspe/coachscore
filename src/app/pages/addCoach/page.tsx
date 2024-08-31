'use client'
import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const AddCoachPage: React.FC = () => {
  const [coachFirstName, setCoachFirstName] = useState('')
  const [coachLastName, setCoachLastName] = useState('')
  const [school, setSchool] = useState('')
  const [sport, setSport] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/coaches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coachFirstName, coachLastName, school, sport }),
      })

      if (!response.ok) {
        throw new Error('Failed to add coach')
      }

      const data = await response.json()
      router.push(`/pages/coach/${data.coachId}`)
    } catch (err) {
      setError('An error occurred while adding the coach. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Add a Coach | Rate My Coach</title>
        <meta name="description" content="Add a new coach to Rate My Coach" />
      </Head>

      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Add a Coach</h1>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="coachFirstName" className="block text-sm font-medium text-gray-300 mb-1">
              Coach First Name
            </label>
            <input
              type="text"
              id="coachFirstName"
              value={coachFirstName}
              onChange={(e) => setCoachFirstName(e.target.value)}
              className="w-full px-4 py-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label htmlFor="coachLastName" className="block text-sm font-medium text-gray-300 mb-1">
              Coach Last Name
            </label>
            <input
              type="text"
              id="coachLastName"
              value={coachLastName}
              onChange={(e) => setCoachLastName(e.target.value)}
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
            disabled={isLoading}
          >
            {isLoading ? 'Adding Coach...' : 'Add Coach'}
          </button>
        </form>
      </div>
    </>
  )
}

export default AddCoachPage