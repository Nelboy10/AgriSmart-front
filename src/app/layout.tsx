import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Providers } from '@/components/providers/AppWrapper';

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AgriSmart - Connecter les agriculteurs du Bénin",
  description: "Plateforme intelligente pour l'agriculture béninoise",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`} suppressHydrationWarning={true}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
