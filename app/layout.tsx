import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trisellr | Home",
  description: "Your business workspace"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
