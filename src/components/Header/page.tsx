import Link from 'next/link'
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Poppins } from 'next/font/google'

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"]
})

const Header: React.FC = async () => {
  const { userId } = await auth();

  return (
    <header className="bg-indigo-950 bg-opacity-70 text-white py-4 px-6 shadow-lg">
    <div className="container mx-auto flex justify-between items-center">
      <Link href="/" className={`text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition duration-300 ${font.className}`}>
        Coach Score
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
              <li>
                <Link href="/pages/my-reviews" className="text-blue-300 hover:text-blue-200 transition duration-300">
                  My Reviews
                </Link>
              </li>
            </>
          )}
          <li>
          {userId === null ? (
              <Link href="/sign-in">
                <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
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