import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { AuthProvider } from '@/context/AuthContext'; 
import { AuthInitializer } from '@/components/providers/AppWrapper';
import { Toaster } from 'sonner'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AgriSmart - Connecter les agriculteurs du Bénin",
  description: "Plateforme intelligente pour l'agriculture béninoise",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`} suppressHydrationWarning={true}>
        <AuthInitializer />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange={true}
          >
            <Navbar />
            <Toaster richColors position="top-right" />
            <AuthProvider>
            <main className="flex-grow">
              {children}</main>
              <ToastContainer position="bottom-right" />
            </AuthProvider>
            <Footer />
          </ThemeProvider>
      </body>
    </html>
  )
}
