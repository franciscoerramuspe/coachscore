import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FaEnvelope } from 'react-icons/fa'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-950 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="bg-indigo-900 bg-opacity-50 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center text-yellow-400">Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-blue-200 mb-4">
              For support or inquiries, please contact us at:
            </p>
            <a href="mailto:coachscorehelp@gmail.com" className="flex items-center justify-center text-yellow-400 hover:text-yellow-300 transition duration-300">
              <FaEnvelope className="mr-2" />
              coachscorehelp@gmail.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}