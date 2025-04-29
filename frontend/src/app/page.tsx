"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import InboxWrapper from "@/app/inboxWrapper";
import AdminDashboard from "@/components/Dashboard/AdminDashboard";
import ProjectManagerDashboard from "@/components/Dashboard/ProjectManagerDashboard";
import TeamMemberDashboard from "@/components/Dashboard/TeamMemberDashboard";

const DashboardPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <InboxWrapper>
        <div className="p-6">Загрузка...</div>
      </InboxWrapper>
    );
  }

  if (!user) {
    return (
      <InboxWrapper>
        <div className="p-6 text-gray-500">Пользователь не авторизован</div>
      </InboxWrapper>
    );
  }

  // Выбираем дашборд в зависимости от роли
  let dashboardComponent;
  switch (user.role) {
    case "admin":
      dashboardComponent = <AdminDashboard />;
      break;
    case "project_manager":
      dashboardComponent = <ProjectManagerDashboard />;
      break;
    default:
      dashboardComponent = <TeamMemberDashboard />;
  }

  return <InboxWrapper>{dashboardComponent}</InboxWrapper>;
};

export default DashboardPage;