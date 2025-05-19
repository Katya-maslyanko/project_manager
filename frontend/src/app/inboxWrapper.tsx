"use client";

import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedLayout from "./ProtectedLayout";

interface InboxLayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
}

const InboxLayout: React.FC<InboxLayoutProps> = ({ children, onSearch }) => {
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
          <Navbar onSearch={onSearch || (() => {})} />
          <div className="pt-6 mx-auto max-w-(--breakpoint-2xl) md:pt-6">{children}</div>
        </main>
      </div>
    </ProtectedLayout>
  );
};

interface InboxWrapperProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
}

const InboxWrapper: React.FC<InboxWrapperProps> = ({ children, onSearch }) => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <InboxLayout onSearch={onSearch}>{children}</InboxLayout>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default InboxWrapper;