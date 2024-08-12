import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "../components/Header/page"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rate My Coach",
  description: "Rate and review college coaches",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-black text-white`}>
          <Header />
            {children}
        </body>
      </html>
    </ClerkProvider>
  );
}