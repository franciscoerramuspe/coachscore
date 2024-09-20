'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { motion } from "framer-motion"
import Image from 'next/image'

interface School {
  schoolId: string;
  name: string;
  logo: string;
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
  const [isSchoolSelected, setIsSchoolSelected] = useState(false)
  const [isSportSelected, setIsSportSelected] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSchoolSearch = useCallback(async (query: string) => {
    if (isSchoolSelected) {
      // If a school is already selected, don't perform a new search
      return;
    }
    setSchoolQuery(query)
    setIsSchoolSelected(false)
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
  }, [isSchoolSelected])

  const handleSportSearch = useCallback(async (query: string) => {
    if (isSportSelected) {
      // If a sport is already selected, don't perform a new search
      return;
    }
    setSportQuery(query)
    setIsSportSelected(false)
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
  }, [isSportSelected])

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!coachFirstName || !coachLastName || !selectedSchool || !selectedSport) {
      setValidationError('All fields are required');
      return;
    }

    setIsModalOpen(true);
  }

  const confirmAddCoach = async () => {
    setIsModalOpen(false);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/coaches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          coachFirstName, 
          coachLastName, 
          school: selectedSchool?.schoolId, 
          sport: selectedSport?.sportId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add coach');
      }

      const data = await response.json();
      router.push(`/pages/coach/${data.coachId}`);
    } catch (err) {
      setError('An error occurred while adding the coach. Please try again.');
      setIsSubmitting(false);
    }
  }

  const ConfirmationModal = ({ isOpen, onClose, onConfirm, coachName, sportName, schoolName, schoolLogo }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[475px] bg-indigo-900 text-white border border-indigo-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-400">Confirm Coach Addition</DialogTitle>
          <DialogDescription className="text-blue-200">
            Are you sure you want to add this coach?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-lg font-semibold mb-2">
            Coach: <span className="text-yellow-300">{coachName}</span>
          </p>
          <p className="text-lg mb-2">
            Sport: <span className="text-blue-300">{sportName}</span>
          </p>
          <div className="flex items-center justify-between">
            <p className="text-lg">
              School: <span className="text-blue-300">{schoolName}</span>
            </p>
            {schoolLogo && (
              <Image
                src={schoolLogo}
                alt={`${schoolName} logo`}
                width={60}
                height={60}
                className="object-contain"
              />
            )}
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-full transition duration-300 mr-2"
            onClick={onConfirm}
          >
            Confirm
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
            onClick={onClose}
          >
            Cancel
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

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
                  value={selectedSchool ? selectedSchool.name : schoolQuery}
                  onChange={(e) => {
                    if (isSchoolSelected) {
                      setSelectedSchool(null);
                      setIsSchoolSelected(false);
                    }
                    setSchoolQuery(e.target.value);
                  }}
                  className="bg-indigo-800 border-indigo-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400"
                  placeholder="Search for a school..."
                  required
                />
                {filteredSchools.length > 0 && !isSchoolSelected && (
                  <div className="absolute z-10 w-full mt-1 bg-indigo-700 border border-indigo-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredSchools.map((school) => (
                      <div
                        key={school.schoolId}
                        className="px-4 py-3 hover:bg-indigo-600 cursor-pointer text-white flex items-center justify-between"
                        onClick={() => {
                          setSelectedSchool(school)
                          setFilteredSchools([])
                          setIsSchoolSelected(true)
                        }}
                      >
                        <span>{school.name}</span>
                        {school.logo && (
                          <Image
                            src={school.logo}
                            alt={`${school.name} logo`}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        )}
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
                  value={selectedSport ? selectedSport.name : sportQuery}
                  onChange={(e) => {
                    if (isSportSelected) {
                      setSelectedSport(null);
                      setIsSportSelected(false);
                    }
                    setSportQuery(e.target.value);
                  }}
                  className="bg-indigo-800 border-indigo-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400"
                  placeholder="Search for a sport..."
                  required
                />
                {filteredSports.length > 0 && !isSportSelected && (
                  <div className="absolute z-10 w-full mt-1 bg-indigo-700 border border-indigo-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredSports.map((sport) => (
                      <div
                        key={sport.sportId}
                        className="px-4 py-2 hover:bg-indigo-600 cursor-pointer text-white"
                        onClick={() => {
                          setSelectedSport(sport)
                          setFilteredSports([])
                          setIsSportSelected(true)
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

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmAddCoach}
        coachName={`${coachFirstName} ${coachLastName}`}
        sportName={selectedSport?.name || ''}
        schoolName={selectedSchool?.name || ''}
        schoolLogo={selectedSchool?.logo || ''}
      />

      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-indigo-900 p-6 rounded-lg shadow-xl">
            <Loader2 className="animate-spin h-12 w-12 text-yellow-400 mx-auto" />
            <p className="mt-4 text-white text-center">Adding coach...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddCoachPage