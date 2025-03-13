'use client'; 
import React from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Sidebar from '@/components/Sidebar/Sidebar';
import StoreProvider, { useAppSelector } from './redux';
import { ThemeProvider } from '@/context/ThemeContext'; // Import ThemeProvider
import { SidebarProvider } from '@/context/SidebarContext'; // Import SidebarProvider

const InboxLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarButton = useAppSelector((state) => state.global.isSidebarButton);

  return (
    <div className='flex min-h-screen w-full bg-gray-50 text-gray-900'>
      <Sidebar />
      <main className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${isSidebarButton ? "" : "md:pl-64"}`}>
        <Navbar />
        {children}
      </main>
    </div>
  );
}

const InboxWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <ThemeProvider>
        <SidebarProvider> {/* Wrap InboxLayout with SidebarProvider */}
          <InboxLayout>{children}</InboxLayout>
        </SidebarProvider>
      </ThemeProvider>
    </StoreProvider>
  );
};

export default InboxWrapper;