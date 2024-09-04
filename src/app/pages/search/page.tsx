'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { FaGraduationCap, FaUserTie, FaSearch, FaPlus } from 'react-icons/fa'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
  </div>
)

const SearchPage: React.FC = () => {
  const [searchType, setSearchType] = useState<'school' | 'coach'>('coach')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [displayedResults, setDisplayedResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const resultsContainerRef = useRef<HTMLDivElement>(null)

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value as 'school' | 'coach')
    setSearchQuery('')
    setSearchResults([])
    setDisplayedResults([])
  }

  const handleSearch = useCallback(async () => {
    if (searchQuery.length === 0) {
      setSearchResults([])
      setDisplayedResults([])
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const endpoint = searchType === 'school' ? '/api/schools/search' : '/api/coaches/search'
      const response = await fetch(`${endpoint}?q=${searchQuery}&limit=5&offset=0`)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${searchType}s`)
      }
      const data = await response.json()
      if (Array.isArray(data.coaches) || Array.isArray(data.schools)) {
        const results = data.coaches || data.schools || []
        setSearchResults(results)
        setDisplayedResults(results)
      } else {
        setError(`No ${searchType}s found`)
      }
    } catch (error) {
      console.error(`Error fetching ${searchType}s:`, error)
      setError(`Failed to fetch ${searchType}s. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }, [searchType, searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  const loadMoreResults = useCallback(async () => {
    if (isLoading || displayedResults.length >= searchResults.length) return

    setIsLoading(true)
    try {
      const endpoint = searchType === 'school' ? '/api/schools/search' : '/api/coaches/search'
      const response = await fetch(`${endpoint}?q=${searchQuery}&limit=5&offset=${displayedResults.length}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch more ${searchType}s`)
      }
      const data = await response.json()
      setDisplayedResults(prev => [...prev, ...(data[`${searchType}s`] || [])])
    } catch (error) {
      console.error(`Error fetching more ${searchType}s:`, error)
      setError(`Failed to load more ${searchType}s. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }, [searchType, searchQuery, displayedResults.length, searchResults.length, isLoading])

  useEffect(() => {
    const handleScroll = () => {
      if (resultsContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = resultsContainerRef.current
        if (scrollTop + clientHeight >= scrollHeight - 20) {
          loadMoreResults()
        }
      }
    }

    const resultsContainer = resultsContainerRef.current
    if (resultsContainer) {
      resultsContainer.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (resultsContainer) {
        resultsContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [loadMoreResults])

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Card className="bg-indigo-900 bg-opacity-50">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center text-yellow-400">
            Find Your {searchType === 'school' ? 'School' : 'Coach'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Select onValueChange={handleSearchTypeChange} defaultValue={searchType}>
              <SelectTrigger className="w-[180px] bg-indigo-800 text-white border-none">
                <SelectValue placeholder="Select search type" />
              </SelectTrigger>
              <SelectContent className="bg-indigo-800 text-white border-none">
                <SelectItem value="school">
                  <div className="flex items-center">
                    <FaGraduationCap className="mr-2" />
                    Schools
                  </div>
                </SelectItem>
                <SelectItem value="coach">
                  <div className="flex items-center">
                    <FaUserTie className="mr-2" />
                    Coaches
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-grow relative">
              <Input
                type="text"
                placeholder={`Search for a ${searchType}`}
                className="w-full bg-transparent border-none focus:outline-none text-white placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                onClick={handleSearch}
                className="absolute right-0 top-0 bottom-0 bg-yellow-500 hover:bg-yellow-600 text-black"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FaSearch />}
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <>
              {displayedResults.length > 0 ? (
                <div 
                  ref={resultsContainerRef}
                  className="mt-6 space-y-4 max-h-96 overflow-y-auto"
                >
                  {displayedResults.map((result) => (
                    <Link key={result.coachId || result.schoolId} href={`/pages/${searchType}/${result.coachId || result.schoolId}`}>
                      <div className="bg-indigo-800 bg-opacity-50 p-4 rounded-lg shadow cursor-pointer hover:bg-indigo-700 transition duration-300">
                        <h2 className="text-xl font-semibold text-white">
                          {searchType === 'coach' 
                            ? `${result.coachFirstName} ${result.coachLastName}`
                            : result.name
                          }
                        </h2>
                        {searchType === 'coach' && (
                          <p className="text-gray-300">{`School: ${result.schoolId}, Sport: ${result.sportId}`}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : searchQuery && (
                <div className="mt-4 text-center">
                  <p className="text-white mb-2">No results found.</p>
                  <Link href={`/pages/add-${searchType}`} className="text-yellow-400 hover:text-yellow-300 inline-flex items-center">
                    <FaPlus className="mr-2" />
                    Can&apos;t find your {searchType}? Add a new one
                  </Link>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SearchPage