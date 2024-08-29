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
    <main className='min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800'>
      <div className='container mx-auto px-4 py-16'>
       <div className='flex flex-col lg:flex-row items-center justify-between'>
         <div className='lg:w-1/2 mb-10 lg:mb-0'>
           <h1 className={cn(
             'text-5xl lg:text-7xl font-bold text-white mb-6',
             font.className
             )}>
             Rate My Coach
           </h1>
           <p className='text-blue-200 text-center mt-12 mb-8'>
          Join our community of athletes and make your voice heard!
          </p>
           <div className='flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4'>
             <Link href="/pages/search">
               <Button variant='secondary' size='lg' className='w-full sm:w-auto'>
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
         <div className='lg:w-1/2'>
           <Image
             src="/hero-image.jpg"
             alt="College athletes"
             width={600}
             height={400}
             className='rounded-lg shadow-2xl'
           />
         </div>
       </div>
       <p className='text-blue-200 text-center mt-12 mb-8'>
         Join our community of athletes and make your voice heard!
       </p>
       <UniversitySlider />
     </div>
   </main>
  )
}