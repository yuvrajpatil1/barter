import Header from "@/shared/widgets/header/header";
import "./global.css";
import { Inter, Roboto } from "next/font/google";

export const metadata = {
  title: "Barter",
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
      <body className={`${roboto.variable} ${inter.variable}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
