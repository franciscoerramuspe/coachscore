import { Poppins } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FaSearch, FaStar } from 'react-icons/fa'
import UniversitySlider from '@/components/UniversitySlider/UniversitySlider'
import Image from 'next/image'

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"]
})

export default async function Home() {
  return (
    <main className='h-screen bg-gradient-to-br from-indigo-950 via-blue-950 to-blue-900 flex flex-col overflow-hidden'>
  <div className='flex-grow flex flex-col justify-center items-center' style={{ height: '70%' }}>
    <div className='max-w-3xl mx-auto text-center px-4 mb-8'>
      <h1 className={cn(
        'text-5xl lg:text-7xl font-bold text-yellow-400 mb-6',
        font.className
      )}>
        Rate My Coach
      </h1>
      <p className='text-xl lg:text-2xl text-blue-200 mb-6'>
        Discover, rate, and review college coaches to make informed decisions about your athletic future.
      </p>
      <p className='text-lg lg:text-xl text-blue-300 mb-8'>
        Join our community of athletes and make your voice heard!
      </p>
      <div className='flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4'>
        <Link href="/pages/search">
          <Button variant='secondary' size='lg' className='w-full sm:w-auto bg-indigo-700 hover:bg-indigo-600 text-white'>
            <FaSearch className="mr-2" /> Search Coaches
          </Button>
        </Link>
        <Link href="/pages/rate">
          <Button variant='default' size='lg' className='w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black'>
            <FaStar className="mr-2" /> Rate a Coach
          </Button>
        </Link>
      </div>
    </div>
  </div>
  <div style={{ height: '30%' }}>
    <UniversitySlider />
  </div>
</main>
  )
}