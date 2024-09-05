'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface School {
  schoolId: string;
  name: string;
}

interface Sport {
  sportId: string;
  name: string;
}

const AddCoachPage: React.FC = () => {
  const [coachFirstName, setCoachFirstName] = useState('')
  const [coachLastName, setCoachLastName] = useState('')
  const [schoolQuery, setSchoolQuery] = useState('')
  const [sportQuery, setSportQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [filteredSchools, setFilteredSchools] = useState<School[]>([])
  const [filteredSports, setFilteredSports] = useState<Sport[]>([])
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null)
  const router = useRouter()

  const handleSchoolSearch = useCallback(async (query: string) => {
    setSchoolQuery(query)
    if (query.length === 0) {
      setFilteredSchools([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/schools/search?q=${query}&limit=5`)
      if (!response.ok) {
        throw new Error('Failed to fetch schools')
      }
      const data = await response.json()
      const schoolsData = data.schools || []
      setFilteredSchools(schoolsData)
      setSchools(prevSchools => [...prevSchools, ...schoolsData])
    } catch (error) {
      console.error('Error fetching schools:', error)
      setError('Failed to fetch schools. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSportSearch = useCallback(async (query: string) => {
    setSportQuery(query)
    if (query.length === 0) {
      setFilteredSports([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/sports/search?q=${query}&limit=5`)
      if (!response.ok) {
        throw new Error('Failed to fetch sports')
      }
      const data = await response.json()
      const sportsData = data.sports || []
      setFilteredSports(sportsData)
      setSports(prevSports => [...prevSports, ...sportsData])
    } catch (error) {
      console.error('Error fetching sports:', error)
      setError('Failed to fetch sports. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSchoolSearch(schoolQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [schoolQuery, handleSchoolSearch])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSportSearch(sportQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [sportQuery, handleSportSearch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setValidationError('')

    if (!coachFirstName || !coachLastName || !selectedSchool || !selectedSport) {
      setValidationError('All fields are required')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/coaches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          coachFirstName, 
          coachLastName, 
          school: selectedSchool.schoolId, 
          sport: selectedSport.sportId 
        }),
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
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card className="bg-indigo-900 bg-opacity-50">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center text-yellow-400">Add a Coach</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {validationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Validation Error</AlertTitle>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="coachFirstName" className="text-gray-300">
                Coach First Name
              </Label>
              <Input
                type="text"
                id="coachFirstName"
                value={coachFirstName}
                onChange={(e) => setCoachFirstName(e.target.value)}
                className="bg-indigo-800 border-indigo-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coachLastName" className="text-gray-300">
                Coach Last Name
              </Label>
              <Input
                type="text"
                id="coachLastName"
                value={coachLastName}
                onChange={(e) => setCoachLastName(e.target.value)}
                className="bg-indigo-800 border-indigo-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school" className="text-gray-300">
                School
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  id="school"
                  value={schoolQuery}
                  onChange={(e) => setSchoolQuery(e.target.value)}
                  className="bg-indigo-800 border-indigo-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400"
                  placeholder="Search for a school..."
                  required
                />
                {filteredSchools.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-indigo-700 border border-indigo-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredSchools.map((school) => (
                      <div
                        key={school.schoolId}
                        className="px-4 py-2 hover:bg-indigo-600 cursor-pointer text-white"
                        onClick={() => {
                          setSchoolQuery(school.name)
                          setSelectedSchool(school)
                          setFilteredSchools([])
                        }}
                      >
                        {school.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport" className="text-gray-300">
                Sport
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  id="sport"
                  value={sportQuery}
                  onChange={(e) => setSportQuery(e.target.value)}
                  className="bg-indigo-800 border-indigo-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400"
                  placeholder="Search for a sport..."
                  required
                />
                {filteredSports.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-indigo-700 border border-indigo-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredSports.map((sport) => (
                      <div
                        key={sport.sportId}
                        className="px-4 py-2 hover:bg-indigo-600 cursor-pointer text-white"
                        onClick={() => {
                          setSportQuery(sport.name)
                          setSelectedSport(sport)
                          setFilteredSports([])
                        }}
                      >
                        {sport.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Coach...
                </>
              ) : (
                'Add Coach'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddCoachPage