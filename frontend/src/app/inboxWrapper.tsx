'use client'; 

import React from 'react'
import Navbar from '@/app/(components)/Navbar/page';
import Sidebar from '@/app/(components)/Sidebar';
import StoreProvider, { useAppSelector } from './redux';

type Props = {}

const InboxLayout = ({ children }: {children: React.ReactNode}) => {
  const isSidebarButton = useAppSelector(
    (state) => state.global.isSidebarButton,
  )

  return (
    <div className='flex min-h-screen w-full bg-gray-50 text-gray-900'>
        {/*sidebar*/}
        <Sidebar />
        <main
        className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${
            isSidebarButton ? "" : "md:pl-64"}`}>
            {/*navbar*/}
            <Navbar />
            {children}
        </main>
    </div>
  )
}

const InboxWrapper = ({ children }: {children: React.ReactNode}) => {
    return (
        <StoreProvider>
            <InboxLayout>{children}</InboxLayout>
        </StoreProvider>
    );
};

export default InboxWrapper