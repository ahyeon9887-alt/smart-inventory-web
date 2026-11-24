'use client';

import React from 'react';
import { 
  Boxes, 
  ArrowLeftRight, 
  Settings2, 
  BarChart3, 
  RefreshCw, 
  Database,
  AlertCircle
} from 'lucide-react';

export type TabType = 'inventory' | 'transactions' | 'management' | 'analysis';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  reorderNeededCount: number;
  onRefresh: () => void;
  isLoading: boolean;
  onLoadSampleData: () => void;
  isDbConnected: boolean;
}

export default function Navbar({
  currentTab,
  onTabChange,
  reorderNeededCount,
  onRefresh,
  isLoading,
  onLoadSampleData,
  isDbConnected,
}: NavbarProps) {
  const tabs = [
    {
      id: 'inventory' as TabType,
      label: '재고 현황 · 발주 알림',
      icon: Boxes,
      badge: reorderNeededCount > 0 ? reorderNeededCount : null,
    },
    {
      id: 'transactions' as TabType,
      label: '입출고 등록',
      icon: ArrowLeftRight,
    },
    {
      id: 'management' as TabType,
      label: '품목 · 거래처 관리',
      icon: Settings2,
    },
    {
      id: 'analysis' as TabType,
      label: 'IE 재고 분석',
      icon: BarChart3,
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  스마트 재고관리 시스템
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  IE Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Industrial Engineering Smart Inventory Manager & Supabase
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Supabase status badge */}
            <div className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isDbConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <Database className="w-3.5 h-3.5" />
              <span>{isDbConnected ? 'Supabase 연동 완료' : 'Supabase 연결 중'}</span>
            </div>

            {/* Load Sample Data button */}
            <button
              onClick={onLoadSampleData}
              title="Supabase 또는 로컬에 IE 표준 샘플 품목/거래처 데이터를 불러옵니다"
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center space-x-1 font-medium"
            >
              <span>샘플 데이터 로드</span>
            </button>

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="데이터 동기화"
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none border-t border-slate-100 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-rose-500 text-white ring-2 ring-white/30'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
