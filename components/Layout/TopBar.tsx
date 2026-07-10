'use client';

import { Bell, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  type: string;
  title: string;
  summary: string;
  is_read: number;
  created_at: string;
}

export function TopBar({ title }: { title: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => setNotifications(d.notifications ?? []))
      .catch(() => {});
  }, []);

  function getTypeIcon(type: string) {
    const map: Record<string, string> = {
      complaint: '⚠️', deadline: '📋', attendance: '👤', consultation: '💬',
    };
    return map[type] ?? '🔔';
  }

  function formatTime(dt: string) {
    const diff = Date.now() - new Date(dt).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
  }

  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-white border-b border-border flex items-center px-6 gap-4 z-20">
      {/* 제목 */}
      <h1 className="text-sm font-semibold text-text-primary flex-1">{title}</h1>

      {/* 검색 */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="검색..."
          className="pl-9 pr-4 py-1.5 text-sm bg-background border border-border rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* 알림 */}
      <div className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-text-secondary" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifs && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
            <div className="absolute right-0 top-11 w-80 bg-white border border-border rounded-xl shadow-modal z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">알림</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-primary font-medium">{unreadCount}개 미읽음</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-text-muted">새 알림이 없습니다</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-border last:border-0 hover:bg-gray-50 transition-colors ${
                        !n.is_read ? 'bg-primary-light/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base mt-0.5">{getTypeIcon(n.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-text-primary truncate">{n.title}</div>
                          <div className="text-xs text-text-secondary mt-0.5 line-clamp-2">{n.summary}</div>
                          <div className="text-[10px] text-text-muted mt-1">{formatTime(n.created_at)}</div>
                        </div>
                        {!n.is_read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 프로필 */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">김</span>
        </div>
      </div>
    </header>
  );
}
