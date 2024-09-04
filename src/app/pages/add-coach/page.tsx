'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface School {
  id: string;
  name: string;
}

interface Sport {
  id: string;
  name: string;
}

const AddCoachPage: React.FC = () => {
  const [coachFirstName, setCoachFirstName] = useState('')
  const [coachLastName, setCoachLastName] = useState('')
  const [school, setSchool] = useState('')
  const [sport, setSport] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [filteredSchools, setFilteredSchools] = useState<School[]>([])
  const [filteredSports, setFilteredSports] = useState<Sport[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schoolsResponse = await fetch('/api/schools')
        const sportsResponse = await fetch('/api/sports')
        const schoolsData = await schoolsResponse.json()
        const sportsData = await sportsResponse.json()
        setSchools(schoolsData)
        setSports(sportsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load schools and sports data. Please try again.')
      }
    }
    fetchData()
  }, [])

  const handleSchoolSearch = (value: string) => {
    setSchool(value)
    setFilteredSchools(
      schools.filter((s) => s.name.toLowerCase().includes(value.toLowerCase()))
    )
  }

  const handleSportSearch = (value: string) => {
    setSport(value)
    setFilteredSports(
      sports.filter((s) => s.name.toLowerCase().includes(value.toLowerCase()))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setValidationError('')

    if (!coachFirstName || !coachLastName || !school || !sport) {
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
              <Popover>
                <PopoverTrigger asChild>
                  <Input
                    type="text"
                    id="school"
                    value={school}
                    onChange={(e) => handleSchoolSearch(e.target.value)}
                    className="bg-indigo-800 border-indigo-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400"
                    placeholder="Search for a school..."
                    required
                  />
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandEmpty>No school found.</CommandEmpty>
                    <CommandGroup>
                      {filteredSchools.map((s) => (
                        <CommandItem
                          key={s.id}
                          onSelect={() => {
                            setSchool(s.name)
                            setFilteredSchools([])
                          }}
                        >
                          {s.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport" className="text-gray-300">
                Sport
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Input
                    type="text"
                    id="sport"
                    value={sport}
                    onChange={(e) => handleSportSearch(e.target.value)}
                    className="bg-indigo-800 border-indigo-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400"
                    placeholder="Search for a sport..."
                    required
                  />
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandEmpty>No sport found.</CommandEmpty>
                    <CommandGroup>
                      {filteredSports.map((s) => (
                        <CommandItem
                          key={s.id}
                          onSelect={() => {
                            setSport(s.name)
                            setFilteredSports([])
                          }}
                        >
                          {s.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
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