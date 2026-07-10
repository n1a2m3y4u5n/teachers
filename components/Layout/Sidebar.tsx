'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText, Bell, BookOpen, Award, Search, Calendar,
  MessageSquare, Users, Send,
  Activity, Shield, Heart,
  UserCheck, BarChart2, TrendingUp,
  ChevronDown, ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  color: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: '행정 AI',
    icon: FileText,
    color: 'text-blue-600',
    items: [
      { label: '공문 초안', href: '/admin/document', icon: FileText },
      { label: '가정통신문', href: '/admin/notice', icon: Bell },
      { label: '수업 지도안', href: '/admin/lesson', icon: BookOpen },
      { label: '수행평가 루브릭', href: '/admin/rubric', icon: Award },
      { label: '교육자료 찾기', href: '/admin/materials', icon: Search },
      { label: '마감 캘린더', href: '/admin/calendar', icon: Calendar },
    ],
  },
  {
    label: '소통 AI',
    icon: MessageSquare,
    color: 'text-green-600',
    items: [
      { label: '학부모 민원', href: '/communication/complaint', icon: MessageSquare },
      { label: '학부모 상담', href: '/communication/consultation', icon: Users },
      { label: '역방향 메시지', href: '/communication/outbound', icon: Send },
    ],
  },
  {
    label: '보호 AI',
    icon: Shield,
    color: 'text-red-600',
    items: [
      { label: '번아웃 지수', href: '/protection/burnout', icon: Activity },
      { label: '법적 보호 문서', href: '/protection/legal', icon: Shield },
      { label: '학교 건강 지수', href: '/protection/school-health', icon: Heart },
    ],
  },
  {
    label: '학생 관리',
    icon: UserCheck,
    color: 'text-purple-600',
    items: [
      { label: '익명 자기보고', href: '/students/report', icon: UserCheck },
      { label: '출결 이상 감지', href: '/students/attendance', icon: BarChart2 },
      { label: '성장 리포트', href: '/students/growth', icon: TrendingUp },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(['행정 AI', '소통 AI', '보호 AI', '학생 관리']);

  function toggleGroup(label: string) {
    setOpenGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-border flex flex-col z-30">
      {/* 로고 */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 h-14 border-b border-border hover:bg-primary-light transition-colors">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-primary text-sm leading-tight">Teachers</div>
          <div className="text-[10px] text-text-muted leading-tight">교사 AI 플랫폼</div>
        </div>
      </Link>

      {/* 네비게이션 */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navGroups.map(group => {
          const isOpen = openGroups.includes(group.label);
          const GroupIcon = group.icon;
          const isGroupActive = group.items.some(item => pathname === item.href || pathname.startsWith(item.href));

          return (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggleGroup(group.label)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isGroupActive ? 'bg-primary-light text-primary' : 'text-text-secondary hover:bg-gray-50'
                }`}
              >
                <GroupIcon className={`w-4 h-4 ${isGroupActive ? 'text-primary' : group.color}`} />
                <span className="flex-1 text-left">{group.label}</span>
                {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {isOpen && (
                <div className="mt-0.5 ml-3 pl-3 border-l border-border">
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors mb-0.5 ${
                          isActive
                            ? 'bg-primary text-white font-medium'
                            : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 하단 */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-light rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-primary">김</span>
          </div>
          <div>
            <div className="text-xs font-medium text-text-primary">김민수 선생님</div>
            <div className="text-[10px] text-text-muted">3학년 2반 담임</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
