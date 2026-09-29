import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriChef AI | Pakistani meal plans",
  description: "Affordable, personalized home-cooked meal plans for Pakistan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
