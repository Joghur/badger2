import "./globals.css";

export const metadata = { title: "Badger v2", description: "Demo" };

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="da" className="text-lg">
    <body className="min-h-screen bg-gray-100 text-gray-900">{children}</body>
  </html>
);

export default RootLayout;
