'use client'
import Link from 'next/link'

const AddCoachPrompt: React.FC = () => {
  return (
    <div className="mt-6 p-4 bg-gray-800 rounded-lg text-center">
      <p className="text-gray-300 mb-2">Can&apos;t find your coach?</p>
      <Link href="/pages/addCoach" className="text-yellow-400 hover:text-yellow-300 font-bold transition duration-300">
        Add your coach
      </Link>
    </div>
  )
}

export default AddCoachPrompt