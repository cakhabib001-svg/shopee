import "./globals.css";

export const metadata = {
  title: "Shopee Link Generator",
  description: "Auto Thumbnail Generator"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}