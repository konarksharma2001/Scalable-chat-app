import { Toaster } from "react-hot-toast";
export const metadata = {
  title: 'Scalable Chat App',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Toaster />
      <body>{children}</body>
    </html>
  )
}
