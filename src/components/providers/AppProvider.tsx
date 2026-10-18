'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/db/types';
import { Language, Direction, getTranslation, formatCurrency } from '@/lib/i18n';

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
  language: Language;
  direction: Direction;
  isRtl: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  fmtCurrency: (amount: number) => string;
  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(ALL_USERS[0]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [language, setLanguageState] = useState<Language>('en');
  const [toast, setToast] = useState<string | null>(null);

  // Load language from localStorage if available
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
    const next = language === 'en' ? 'ar' : 'en';
    setLanguage(next);
  };

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  const t = (key: string) => getTranslation(key, language);
  const fmtCurrency = (amount: number) => formatCurrency(amount, language);

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
