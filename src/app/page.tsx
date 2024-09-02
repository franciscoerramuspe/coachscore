import { Poppins } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FaSearch, FaStar, FaUserSecret } from 'react-icons/fa'
import UniversitySlider from '@/components/UniversitySlider/UniversitySlider'
import Head from 'next/head'

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"]
})

export default function Home() {
  return (
    <>
      <Head>
        <title>Rate My Coach - Anonymous Reviews for College Coaches</title>
        <meta name="description" content="Rate My Coach provides a platform for student-athletes to anonymously discover, rate, and review college coaches, ensuring honest feedback for informed decisions." />
      </Head>
      <main className='min-h-screen flex flex-col overflow-hidden'>
        <div className='flex-grow flex flex-col justify-center items-center p-4 md:p-8' style={{ minHeight: '70vh' }}>
          <div className='max-w-4xl mx-auto text-center px-4 mb-8'>
            <h1 className={cn(
              'text-4xl sm:text-5xl lg:text-7xl font-bold text-yellow-400 mb-6',
              font.className
            )}>
              Rate My Coach
            </h1>
            <div className="bg-indigo-800 text-white py-2 px-4 rounded-full inline-block mb-6">
              <FaUserSecret className="inline-block mr-2" aria-hidden="true" />
              100% Anonymous Reviews
            </div>
            <p className='text-lg sm:text-xl lg:text-2xl text-blue-200 mb-6'>
              Discover, rate, and review college coaches anonymously to make informed decisions about your athletic future.
            </p>
            <p className='text-base sm:text-lg lg:text-xl text-blue-300 mb-8'>
              Join our community of athletes and make your voice heard without fear!
            </p>
            <div className='flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4'>
              <Link href="/pages/search" passHref>
                <Button variant='secondary' size='lg' className='w-full sm:w-auto bg-indigo-700 hover:bg-indigo-600 text-white transition-colors duration-300'>
                  <FaSearch className="mr-2" aria-hidden="true" /> Search Coaches
                </Button>
              </Link>
              <Link href="/pages/rate" passHref>
                <Button variant='default' size='lg' className='w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black transition-colors duration-300'>
                  <FaStar className="mr-2" aria-hidden="true" /> Rate Anonymously
                </Button>
              </Link>
            </div>
            <p className='text-sm text-blue-300 mt-4'>
              Your privacy is our priority. All reviews are completely anonymous.
            </p>
          </div>
        </div>
        <div className="mt-auto" style={{ minHeight: '30vh' }}>
          <UniversitySlider />
        </div>
      </main>
    </>
  )
}