import { SignIn } from "@clerk/nextjs";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from 'next/image';

const SignInPage = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-indigo-950 via-blue-950 to-blue-900 p-4">
      {/* TODO: Add logo */}
      {/* <div className="w-full max-w-md mb-8">
        <Image 
          src="/path-to-your-logo.png" 
          alt="Rate My Coach Logo" 
          width={200} 
          height={60} 
          className="mx-auto"
        />
      </div> */}
      <Card className="w-full max-w-md bg-indigo-900 bg-opacity-50 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-indigo-800 py-6">
          <CardTitle className="text-3xl font-bold text-center text-yellow-400">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <SignIn appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm normal-case rounded-full py-3 transition-all duration-200",
                card: "bg-transparent shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: 
                  "bg-indigo-700 text-white border border-indigo-600 hover:bg-indigo-600 transition-all duration-200 rounded-full",
                formFieldInput: 
                  "bg-indigo-800 border-indigo-700 text-white placeholder-indigo-400 rounded-full",
                formFieldLabel: "text-indigo-300 font-semibold",
                footerActionLink: "text-yellow-400 hover:text-yellow-300 font-semibold",
                dividerLine: "bg-indigo-700",
                dividerText: "text-indigo-400",
              },
            }} />
          </div>
        </CardContent>
      </Card>
      <p className="mt-8 text-indigo-300 text-center">
        Need help? <a href="#" className="text-yellow-400 hover:text-yellow-300">Contact Support</a>
      </p>
    </div>
  );
};

export default SignInPage;