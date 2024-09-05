'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  sport: string;
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const schoolResponse = await fetch(`/api/schools/${schoolId}`)
        const coachesResponse = await fetch(`/api/schools/${schoolId}/coaches`)
        
        if (!schoolResponse.ok) {
          throw new Error(`Failed to fetch school data: ${schoolResponse.statusText}`)
        }
        if (!coachesResponse.ok) {
          throw new Error(`Failed to fetch coaches data: ${coachesResponse.statusText}`)
        }

        const schoolData = await schoolResponse.json()
        const coachesData = await coachesResponse.json()

        setSchool(schoolData)
        setCoaches(coachesData)
      } catch (err: any) {
        console.error('Error fetching school data:', err)
        setError(`An error occurred while loading the school data: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchoolData()
  }, [schoolId])

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-950 to-blue-900 py-12 px-4">
      <Card className="bg-indigo-900 bg-opacity-50 max-w-4xl mx-auto">
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
        <CardContent>
          <h2 className="text-2xl font-semibold text-white mb-4">Coaches</h2>
          {coaches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coaches.map((coach) => (
                <Link key={coach.id} href={`/pages/coach/${coach.id}`}>
                  <Card className="bg-indigo-800 hover:bg-indigo-700 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-white">{`${coach.firstName} ${coach.lastName}`}</h3>
                      <p className="text-blue-300">{coach.sport}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No coaches found for this school.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}