export const metadata = { title: "Badger v2", description: "Demo" };

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html
    lang="da"
    className="
      text-[18px]
      [@media(min-width:1600px)]:text-[20px]
      [@media(min-width:1920px)]:text-[21px]
      [@media(min-width:2560px)]:text-[22px]
      [@media(min-width:3200px)]:text-[24px]
    "
  >
    <body className="min-h-screen bg-gray-100 text-gray-900">{children}</body>
  </html>
);

export default RootLayout;
