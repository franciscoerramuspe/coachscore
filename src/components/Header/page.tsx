import Link from 'next/link'
import { SignInButton, UserButton } from "@clerk/nextjs"
import { auth } from '@clerk/nextjs/server';

const Header: React.FC = async () => {
  const { userId } = await auth();

  return (
    <header className="bg-gray-900 text-white py-4 px-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/pages/home" className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition duration-300">
          Rate My Coach
        </Link>
        
        <nav>
          <ul className="flex space-x-6 items-center">
            {userId !== null && (
              <>
                <li>
                  <Link href="/pages/search" className="text-blue-300 hover:text-blue-200 transition duration-300">
                    Search
                  </Link>
                </li>
                <li>
                  <Link href="/pages/rate" className="text-blue-300 hover:text-blue-200 transition duration-300">
                    Rate
                  </Link>
                </li>
              </>
            )}
            <li>
            {userId === null ? (
                <Link href="/sign-in">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
                    Sign In
                  </button>
                </Link>
              ) : (
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header