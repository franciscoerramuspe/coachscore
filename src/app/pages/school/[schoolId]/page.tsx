'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Coach {
  coachId: string;
  coachFirstName: string;
  coachLastName: string;
  sportName: string;
}

interface School {
  schoolId: string;
  name: string;
  logo: string;
}

export default function SchoolPage() {
  const { schoolId } = useParams()
  const [school, setSchool] = useState<School | null>(null)
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [sports, setSports] = useState<string[]>(['All'])
  const [selectedSport, setSelectedSport] = useState<string>('All')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const [schoolResponse, coachesResponse] = await Promise.all([
          fetch(`/api/schools/${schoolId}`),
          fetch(`/api/schools/${schoolId}/coaches`)
        ])
        
        if (!schoolResponse.ok || !coachesResponse.ok) {
          throw new Error(`Failed to fetch data`)
        }

        const [schoolData, coachesData] = await Promise.all([
          schoolResponse.json(),
          coachesResponse.json()
        ])

        setSchool(schoolData)
        setCoaches(coachesData.coaches)
        console.log(coachesData)
        
        const uniqueSports: any = Array.from(new Set(coachesData.coaches.map((coach: Coach) => coach.sportName)))
        setSports(['All', ...uniqueSports])
      } catch (err: any) {
        console.error('Error fetching school data:', err)
        setError(`An error occurred while loading the school data: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchoolData()
  }, [schoolId])

  const filteredCoaches = selectedSport === 'All' 
    ? coaches 
    : coaches.filter(coach => coach.sportName === selectedSport)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-950 via-blue-950 to-blue-900">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-950 via-blue-950 to-blue-900">
        <Card className="bg-indigo-900 bg-opacity-50 max-w-lg w-full">
          <CardContent className="p-6">
            <p className="text-red-500 text-center">{error || 'School not found'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-950 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="bg-indigo-900 bg-opacity-50 max-w-6xl mx-auto">
        <CardHeader className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 relative overflow-hidden rounded-full bg-white">
            <Image
              src={school.logo}
              alt={`${school.name} logo`}
              layout="fill"
              objectFit="contain"
              className="p-2"
            />
          </div>
          <CardTitle className="text-4xl font-bold text-center text-yellow-400">{school.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <label htmlFor="sportFilter" className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Sport:
            </label>
            <Select onValueChange={setSelectedSport} defaultValue="All">
              <SelectTrigger className="w-full bg-indigo-800 text-white border-indigo-700">
                <SelectValue placeholder="Select a sport" />
              </SelectTrigger>
              <SelectContent className="bg-indigo-800 text-white border-indigo-700">
                {sports.map((sport) => (
                  <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4">Coaches</h2>
          {filteredCoaches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCoaches.map((coach) => (
                <Link key={coach.coachId} href={`/pages/coach/${coach.coachId}`}>
                  <Card className="bg-indigo-800 hover:bg-indigo-700 transition-colors cursor-pointer h-full">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{`${coach.coachFirstName} ${coach.coachLastName}`}</h3>
                        <p className="text-blue-300">{coach.sportName}</p>
                      </div>
                      <div className="mt-4 text-yellow-400 text-sm">View Profile</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center">No coaches found for this school or sport.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}