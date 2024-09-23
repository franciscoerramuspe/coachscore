'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search } from 'lucide-react'

interface Coach {
  coachId: string
  coachFirstName: string
  coachLastName: string
  schoolName: string
  sportName: string
  averageRating: number
}

export default function CoachCompare() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('highestRated')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCoaches()
  }, [])

  const fetchCoaches = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/coaches/all?limit=50')
      if (!response.ok) {
        throw new Error('Failed to fetch coaches')
      }
      const data = await response.json()
      setCoaches(data.coaches || [])
    } catch (error) {
      console.error('Error fetching coaches:', error)
      setError('Failed to load coaches. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedCoaches = useMemo(() => {
    return coaches
      .filter(coach => 
        coach.coachFirstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.coachLastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.sportName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => 
        sortBy === 'highestRated' ? b.averageRating - a.averageRating : a.averageRating - b.averageRating
      )
      .slice(0, 10)
  }, [coaches, searchQuery, sortBy])

  const chartData = filteredAndSortedCoaches.map(coach => ({
    name: `${coach.coachFirstName} ${coach.coachLastName}`,
    rating: coach.averageRating
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-950 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Coach Comparison</h1>
        
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search coaches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-indigo-800 text-white border-indigo-700"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <Select onValueChange={setSortBy} defaultValue={sortBy}>
            <SelectTrigger className="w-full sm:w-[180px] bg-indigo-800 text-white border-indigo-700">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highestRated">Highest Rated</SelectItem>
              <SelectItem value="lowestRated">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-indigo-800 bg-opacity-50 text-white">
              <CardHeader>
                <CardTitle>Top 10 Coaches</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '8px' }}
                      labelStyle={{ color: '#fbbf24' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="rating" fill="#fbbf24" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-indigo-800 bg-opacity-50 text-white">
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAndSortedCoaches.map((coach, index) => (
                    <motion.div
                      key={coach.coachId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-indigo-700 bg-opacity-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{`${coach.coachFirstName} ${coach.coachLastName}`}</p>
                        <p className="text-sm text-gray-300">{`${coach.schoolName} - ${coach.sportName}`}</p>
                      </div>
                      <div className="text-yellow-400 font-bold text-lg">
                        {coach.averageRating !== undefined ? coach.averageRating.toFixed(2) : 'N/A'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  )
}