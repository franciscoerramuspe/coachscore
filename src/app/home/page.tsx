import Head from 'next/head'
import Link from 'next/link'

const Home: React.FC = () => {

  
  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>Rate My Coach</title>
        <meta name="description" content="Rate and review college coaches" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <h1 className="text-6xl font-extrabold text-center mb-8 text-yellow-400">
          Rate My Coach
        </h1>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-2xl text-center mb-12 text-blue-300">
            Find and rate coaches for college student-athletes
          </p>
          
          <div className="flex justify-center space-x-6">
            <Link href="/pages/search" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
              Search Coaches
            </Link>
            <Link href="/pages/rate" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
              Rate a Coach
            </Link>
          </div>
        </div>
      </main>

      <footer className="mt-16 py-6 bg-gray-900">
        <p className="text-center text-gray-400">
          © 2024 Rate My Coach. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default Home