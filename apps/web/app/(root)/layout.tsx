import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SocketProvider } from "../../context/SocketProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scalable Chat App",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <SocketProvider>
        <body className={inter.className}>
          <Toaster />
          {children}
        </body>
      </SocketProvider>
    </html>
  );
}
