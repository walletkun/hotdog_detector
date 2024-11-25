import "./globals.css";
import { Inter } from "next/font/google";
import { Header } from "@/components/nav/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Hotdog Detector 2.0: The Revenge",
  description: "The hotdog detector that creates elaborate backstories",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
