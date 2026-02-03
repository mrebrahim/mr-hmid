'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { LogOut, User, Wifi, WifiOff, Trash2, RefreshCw, Check } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useAppointmentsRealtime } from '@/hooks/use-realtime';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/i18n/config';

export function Header() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const { staff, signOut } = useAuth();
  const { isConnected } = useAppointmentsRealtime();

  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleClearCache = async () => {
    if (!confirm(locale === 'ar'
      ? 'هل أنت متأكد من مسح جميع البيانات المخزنة مؤقتًا؟ سيتم إعادة تحميل الصفحة.'
      : 'Are you sure you want to clear all cached data? The page will reload.')) {
      return;
    }

    setIsClearing(true);
    setClearSuccess(false);

    try {
      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear Service Worker caches if available
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      setClearSuccess(true);

      // Show success briefly then reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert(locale === 'ar' ? 'فشل في مسح الذاكرة المؤقتة' : 'Failed to clear cache');
      setIsClearing(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        {/* Page title can be passed as prop or context */}
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time Connection Indicator */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1 rounded-full text-xs',
            isConnected
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          )}
          title={
            isConnected
              ? locale === 'ar' ? 'متصل - يتم مزامنة البيانات تلقائيًا' : 'Connected - Data syncing automatically'
              : locale === 'ar' ? 'غير متصل' : 'Disconnected'
          }
        >
          {isConnected ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          <span className="hidden md:inline">
            {isConnected
              ? locale === 'ar' ? 'متزامن' : 'Synced'
              : locale === 'ar' ? 'غير متصل' : 'Offline'}
          </span>
        </div>

        {/* Clear Cache Button */}
        <button
          onClick={handleClearCache}
          disabled={isClearing || clearSuccess}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium',
            'transition-colors',
            clearSuccess
              ? 'bg-green-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title={locale === 'ar' ? 'مسح الذاكرة المؤقتة' : 'Clear Cache'}
        >
          {isClearing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : clearSuccess ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          <span className="hidden lg:inline">
            {isClearing
              ? locale === 'ar' ? 'جاري المسح...' : 'Clearing...'
              : clearSuccess
              ? locale === 'ar' ? 'تم!' : 'Done!'
              : locale === 'ar' ? 'مسح الذاكرة' : 'Clear Cache'}
          </span>
        </button>

        {staff && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden md:block">
                <p className="font-medium">{staff.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {staff.role}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className={cn(
                'inline-flex items-center justify-center rounded-md p-2 text-sm font-medium',
                'text-muted-foreground hover:bg-muted hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
              title={t('auth.logout')}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
