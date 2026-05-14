import Navbar from "@/components/Navbar"; // Ensure these paths match your folder structure
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";

// Next.js uses metadata exports instead of Helmet
export const metadata = {
  title: "Men Who Feel | The Forge",
  description: "An anonymous network built for men to drop the weight, share the load, and rebuild.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* We lock in the global dark theme right on the body tag */}
      <body className="bg-[#060810] text-slate-200 antialiased selection:bg-teal-500/30">
        <div className="min-h-screen flex flex-col">
          
          {/* Top Navigation */}
          <Navbar />
          
          {/* Main Layout Area */}
          <div className="flex flex-1">
            
            {/* The Smart Sidebar */}
            <Sidebar />
            
            {/* The Page Content (This replaces the old Vite <Outlet />) */}
            <main className="flex-1 min-w-0">
              {children}
            </main>

          </div>
          
          {/* Footer */}
          <Footer />
          
        </div>
      </body>
    </html>
  );
}