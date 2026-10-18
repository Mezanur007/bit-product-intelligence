'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/db/types';
import { Language, Direction, getTranslation, formatCurrency } from '@/lib/i18n';

export const ALL_USERS: User[] = [
  {
    id: 'usr-maruf',
    name: 'Mezanur Maruf (CTO)',
    email: 'maruf@b-it.co',
    username: 'maruf@b-it.co',
    password: 'Bit@123456@',
    role: 'admin',
    roleTitle: 'Super Admin (CTO)',
    department: 'Executive Management & Technology',
    avatarInitials: 'MM',
    createdAt: '2026-10-18T00:00:00Z',
  },
  {
    id: 'usr-coo',
    name: 'Faisal Mohammed (COO)',
    email: 'coo@b--it.co',
    username: 'coo@b--it.co',
    password: 'Bit@123456@',
    role: 'admin',
    roleTitle: 'Super Admin (COO)',
    department: 'Executive Management & Operations',
    avatarInitials: 'FM',
    createdAt: '2026-10-18T00:00:00Z',
  },
];

interface AppContextType {
  currentUser: User;
  setCurrentUser: (u: User) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  refreshUsers: () => Promise<void>;
  addUser: (user: User) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  language: Language;
  direction: Direction;
  isRtl: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  fmtCurrency: (amount: number) => string;
  toast: string | null;
  showToast: (msg: string, type?: 'info' | 'error' | 'success') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(ALL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(ALL_USERS[0]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [language, setLanguageState] = useState<Language>('en');
  const [toast, setToast] = useState<string | null>(null);

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setUsers(data.data);
      }
    } catch {
      // fallback
    }
  };

  const addUser = (newUser: User) => {
    setUsers((prev) => {
      if (prev.some((u) => u.id === newUser.id)) return prev;
      return [...prev, newUser];
    });
  };

  // Load language and users on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('bit_lang') as Language;
      if (savedLang === 'ar' || savedLang === 'en') {
        setLanguageState(savedLang);
        document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = savedLang;
      }
    } catch {
      // ignore
    }
    refreshUsers();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('bit_lang', lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  const t = (key: string) => getTranslation(key, language);
  const fmtCurrency = (amount: number) => formatCurrency(amount, language);

  const showToast = (msg: string, _type?: 'info' | 'error' | 'success') => {
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
        users,
        setUsers,
        refreshUsers,
        addUser,
        isDemoMode,
        setIsDemoMode,
        language,
        direction,
        isRtl: direction === 'rtl',
        setLanguage,
        toggleLanguage,
        t,
        fmtCurrency,
        toast,
        showToast,
      }}
    >
      <div dir={direction} className={direction === 'rtl' ? 'font-arabic' : ''}>
        {children}
      </div>
      {toast && (
        <div
          className={`fixed bottom-6 ${
            direction === 'rtl' ? 'left-6' : 'right-6'
          } z-50 flex items-center gap-3 bg-[#111827] text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium border border-gray-700 animate-fade-in`}
        >
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
