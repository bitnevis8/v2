import "./globals.css";

export const metadata = {
  title: "سیستم حکم ماموریت",
  description: "سیستم مدیریت حکم ماموریت اریا فولاد",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased min-h-screen bg-gray-50">
        <div className="min-h-screen w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
