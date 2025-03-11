"use client"
import React, { useState } from 'react';

const Sidebar = () => {
    const [showProjects, setShowProjects] = useState(true);
    const [showGroups, setShowGroups] = useState(true);
    
    // Классы для боковой панели
    const sidebarClassNames = `fixed flex flex-col h-full justify-between shadow-xl
    transition-all duration-300 z-40 bg-gray-800 text-white w-80 overflow-y-auto`;

    return (
    <div className={sidebarClassNames}>
        <div className="flex h-full w-full flex-col justify-start">
            {/* Название логотипа */}
            <div className="z-50 flex min-h-[56px] w-64 items-center justify-between px-6 pt-3 dark:bg-black">
                <div className="text-2xl font-bold text-white">
                    TASKAPP
                </div>
            </div>
            {/* Ссылки */}
            
        </div>
    </div>
    );
};

export default Sidebar;