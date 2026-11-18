import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});


export const viewport: Viewport = {
  themeColor: "#fbfaf7",
};

export const metadata: Metadata = {
  title: "PawthCare — Digital Pet Health Ecosystem",
  description:
    "A digital health twin for every pet: AI photo screening, an AI health assistant, and a connected clinic record — for pet owners and veterinary clinics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
