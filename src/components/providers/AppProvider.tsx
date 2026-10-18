'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/db/types';

export const ALL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Khalid Al-Mansoor',
    email: 'khalid@b-it.sa',
    role: 'admin',
    roleTitle: 'Chief Executive Officer & Admin',
    department: 'Executive Management',
    avatarInitials: 'KM',
  },
  {
    id: 'usr-management',
    name: 'Tariq Al-Ghamdi',
    email: 'tariq@b-it.sa',
    role: 'management',
    roleTitle: 'VP of Technology & Approver',
    department: 'Management',
    avatarInitials: 'TG',
  },
  {
    id: 'usr-po',
    name: 'Mezanur Rahman',
    email: 'mezanur@b-it.sa',
    role: 'product_owner',
    roleTitle: 'Lead Product Manager',
    department: 'Product Delivery',
    avatarInitials: 'MR',
  },
  {
    id: 'usr-analyst',
    name: 'Sarah Al-Otaibi',
    email: 'sarah@b-it.sa',
    role: 'market_analyst',
    roleTitle: 'Market & Competitive Intelligence Analyst',
    department: 'Strategy & Research',
    avatarInitials: 'SO',
  },
  {
    id: 'usr-tech',
    name: 'Fahad Al-Harbi',
    email: 'fahad@b-it.sa',
    role: 'technical_reviewer',
    roleTitle: 'Solutions Architect & Tech Lead',
    department: 'Engineering',
    avatarInitials: 'FH',
  },
  {
    id: 'usr-finance',
    name: 'Omar Al-Zahrani',
    email: 'omar@b-it.sa',
    role: 'finance_reviewer',
    roleTitle: 'Senior Financial Analyst',
    department: 'Finance & Controlling',
    avatarInitials: 'OZ',
  },
];

interface AppContextType {
  currentUser: User;
  setCurrentUser: (u: User) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(ALL_USERS[0]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isDemoMode,
        setIsDemoMode,
        toast,
        showToast,
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#111827] text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium border border-gray-700 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#315EE8] animate-ping" />
          {toast}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
