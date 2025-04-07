// InboxLayout.tsx
"use client";

import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedLayout from "./ProtectedLayout";

const InboxLayout = ({ children }: { children: React.ReactNode }) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <ProtectedLayout>
      <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
        <Sidebar />
        <main className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
          <Navbar />
          <div className="pt-6 mx-auto max-w-(--breakpoint-2xl) md:pt-6">{children}</div>
        </main>
      </div>
    </ProtectedLayout>
  );
};

const InboxWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <InboxLayout>{children}</InboxLayout>
    </ThemeProvider>
  );
};

export default InboxWrapper;