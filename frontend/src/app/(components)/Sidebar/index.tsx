"use client"
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { toggleSidebarButton } from '@/state';
import { Link, LucideIcon, Home, X, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

const Sidebar = () => {
    const dispatch = useAppDispatch();
    const isSidebarButton = useAppSelector((state) => state.global.isSidebarButton);

    // Классы для боковой панели
    const sidebarClassNames = `fixed flex flex-col h-full justify-between shadow-xl
    transition-all duration-300 z-40 bg-gray-800 text-white overflow-y-auto
    ${isSidebarButton ? 'w-0 hidden' : 'w-[290px]'}`;

    return (
        <div className={sidebarClassNames}>
            <div className="flex h-full w-full flex-col justify-start">
                {/* Название логотипа */}
                <div className="z-50 flex min-h-[56px] w-64 items-center justify-between px-6 pt-3 dark:bg-black">
                    <div className="text-2xl font-bold text-white">TASKAPP</div>
                    <button 
                        className={`py-3 transition-transform duration-300 ${isSidebarButton ? 'rotate-0' : 'rotate-180'}`} 
                        onClick={() => dispatch(toggleSidebarButton(!isSidebarButton))}
                    >
                        {isSidebarButton ? <Menu className="h-6 w-6 text-gray-500 hover:text-gray-300"/> : <X className="h-6 w-6 text-gray-500 hover:text-gray-300"/>}
                    </button>
                </div>
                {/* Ссылки */}
                <nav className="z-10 w-full">
                    <SidebarLink icon={Home} label='Дашборд' href='/'/>
                </nav>
            </div>
        </div>
    );
};

interface SidebarLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href || (pathname === "/" && href === "/dashboard");

    return (
        <Link href={href} className="w-full">
            <div className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-slate-200 text-gray-600 ${isActive ? "bg-gray-100 text-white dark:bg-gray-600" : ""} justify-start px-8 py-3`}>
                {isActive && <div className="absolute left-0 top-0 h-[100%] w-[5px] bg-blue-200" />}
                <Icon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
                <span className={`font-medium text-gray-800 dark:text-gray-100`}>{label}</span>
            </div>
        </Link>
    );
}

export default Sidebar;