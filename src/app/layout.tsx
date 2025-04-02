import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TheHeader from "./views/TheHeader";
import TheFooter from "./views/TheFooter";
import TheSideBar from "./views/TheSideBar";
import { AuthProvider } from "@/lib/AuthProvider";
import "mapbox-gl/dist/mapbox-gl.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IoT App",
  description: "App para gestionar parcelas y sus datos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex`}>
        <AuthProvider>
          <TheSideBar>
            <TheHeader />
            {children}
            <TheFooter />
          </TheSideBar>
        </AuthProvider>
      </body>
    </html>
  );
}
