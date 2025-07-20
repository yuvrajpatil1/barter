import "./global.css";
import { Inter, Roboto } from "next/font/google";
import Provider from "./provider";

export const metadata = {
  title: "Barter - Admin",
  description: "Barter is a multivendor ecommerce platform.",
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "400", "500", "600", "700", "900"],
  variable: "--font-inter",
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "200", "400", "500", "600", "700", "900"],
  variable: "--font-roboto",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen bg-slate-900 antialiased ${roboto.variable} ${inter.variable}`}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
