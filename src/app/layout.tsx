import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "../components/Header/page"
import { connect } from '@/lib/db';

// Función para conectar a la base de datos
const connectToDatabase = async () => {
  try {
    await connect();
    console.log('Conexión a MongoDB establecida correctamente');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
  }
};
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
  await connectToDatabase(); // Conecta a la base de datos al iniciar la aplicación

  return (
    <ClerkProvider>
      <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-indigo-950 via-blue-950 to-blue-900 min-h-screen`}>
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}