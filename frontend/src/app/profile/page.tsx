"use client";

import React from "react";
import { useGetCurrentUserQuery } from "@/state/api";
import Image from "next/image";
import InboxWrapper from "@/app/inboxWrapper";

const UserProfile = () => {
  const { data: user, isLoading, error } = useGetCurrentUserQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;

  return (
    <InboxWrapper>
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Профиль пользователя</h1>
      <div className="flex flex-col md:flex-row">
        {/* Левый блок с информацией о пользователе */}
        <div className="w-full md:w-1/3 p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Image
              src={user.profile_image || "/images/default-profile.png"}
              alt="Profile Picture"
              width={100}
              height={100}
              className="rounded-full"
            />
            <div className="ml-4">
              <h2 className="text-xl font-semibold">{user.first_name} {user.last_name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Личная информация</h3>
          <p><strong>Имя:</strong> {user.first_name}</p>
          <p><strong>Фамилия:</strong> {user.last_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>

        {/* Правый блок с опытом и образованием */}
        <div className="w-full md:w-2/3 p-4 bg-white rounded-lg shadow-md ml-0 md:ml-4">
          <h3 className="text-lg font-semibold mb-2">Опыт</h3>
          <ul className="list-disc list-inside mb-4">
            <li><strong>Figma:</strong> Веб-разработчик, Нью-Йорк, США (2015 - Настоящее время)</li>
            <li><strong>Skype:</strong> Веб-дизайнер, Пало-Альто, США (2011 - 2015)</li>
            <li><strong>Amazon:</strong> Веб-дизайнер, Пало-Альто, США (2009 - 2011)</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2">Образование</h3>
          <ul className="list-disc list-inside">
            <li><strong>SU:</strong> Стэнфордский университет, Компьютерные науки и инженерия (2009 - 2014)</li>
            <li><strong>TJ:</strong> Средняя школа Томаса Джефферсона, Аттестат о среднем образовании (2005 - 2009)</li>
          </ul>
        </div>
      </div>
    </div>
    </InboxWrapper>
  );
};

export default UserProfile;