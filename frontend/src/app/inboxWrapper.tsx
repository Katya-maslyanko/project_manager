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
    ? "sm:ml-[0px] lg:ml-[290px]"
    : "sm:ml-[0px] lg:ml-[90px]";

  return (
    <ProtectedLayout>
      <div className="flex min-h-screen w-full bg-gray-50 text-gray-900 dark:bg-dark-bg dark:text-dark-text">
        <Sidebar />
        <main
          className={`flex-1 transition-all dark:bg-dark-bg duration-300 ease-in-out ml-0 ${mainContentMargin}`}
        >
          <Navbar onSearch={onSearch || (() => {})} />
          <div className="pt-6 mx-auto max-w-(--breakpoint-7xl) md:pt-6">{children}</div>
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