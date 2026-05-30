import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeTaste",
  description: "Authentic homemade meals from local cooks"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
