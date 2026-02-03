'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Settings, Wifi, WifiOff, Activity, Globe, Trash2, RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useAppointmentsRealtime } from '@/hooks/use-realtime';
import type { Locale } from '@/lib/i18n/config';

export default function SettingsPage() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;
  const { staff, isAdmin } = useAuth();
  const { isConnected: realtimeConnected } = useAppointmentsRealtime();

  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const handleClearCache = async () => {
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

      // Show success for 3 seconds then reload
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert(locale === 'ar' ? 'فشل في مسح الذاكرة المؤقتة' : 'Failed to clear cache');
    } finally {
      setIsClearing(false);
    }
  };

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    setRefreshSuccess(false);

    try {
      // Force reload without cache
      window.location.reload();
      setRefreshSuccess(true);
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              {locale === 'ar' ? 'الملف الشخصي' : 'Profile'}
            </h2>
          </div>

          {staff && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'الاسم' : 'Name'}
                </p>
                <p className="font-medium">{staff.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'الدور' : 'Role'}
                </p>
                <p className="font-medium capitalize">{staff.role}</p>
              </div>
              {staff.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'الهاتف' : 'Phone'}
                  </p>
                  <p className="font-medium" dir="ltr">{staff.phone}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Connection Status Card */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              {locale === 'ar' ? 'حالة الاتصال' : 'Connection Status'}
            </h2>
          </div>

          <div className="space-y-4">
            {/* Realtime Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {realtimeConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span>
                  {locale === 'ar' ? 'التحديثات المباشرة' : 'Realtime Updates'}
                </span>
              </div>
              <span
                className={cn(
                  'px-2 py-1 text-xs rounded-full',
                  realtimeConnected
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                )}
              >
                {realtimeConnected
                  ? locale === 'ar' ? 'متصل' : 'Connected'
                  : locale === 'ar' ? 'غير متصل' : 'Disconnected'}
              </span>
            </div>

            {/* Supabase Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span>Supabase</span>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {locale === 'ar' ? 'متصل' : 'Connected'}
              </span>
            </div>
          </div>
        </div>

        {/* Language Card */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              {locale === 'ar' ? 'اللغة' : 'Language'}
            </h2>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {locale === 'ar' ? 'اللغة الحالية' : 'Current Language'}
            </p>
            <p className="font-medium">
              {locale === 'ar' ? 'العربية' : 'English'}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              {locale === 'ar'
                ? 'لتغيير اللغة، قم بتعديل إعدادات المتصفح'
                : 'To change language, modify browser settings'}
            </p>
          </div>
        </div>

        {/* System Info Card */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              {locale === 'ar' ? 'معلومات النظام' : 'System Info'}
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Framework</span>
              <span>Next.js 14</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database</span>
              <span>Supabase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Management Section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">
            {locale === 'ar' ? 'إدارة الذاكرة المؤقتة' : 'Cache Management'}
          </h2>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {locale === 'ar'
            ? 'إذا كنت تواجه مشاكل في تحميل البيانات، يمكنك مسح الذاكرة المؤقتة أو إعادة تحميل الصفحة'
            : 'If you are experiencing issues loading data, you can clear the cache or force refresh the page'}
        </p>

        <div className="flex flex-col gap-3">
          {/* Clear Cache Button */}
          <button
            onClick={handleClearCache}
            disabled={isClearing || clearSuccess}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium',
              'transition-colors',
              clearSuccess
                ? 'bg-green-600 text-white'
                : 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isClearing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {locale === 'ar' ? 'جاري المسح...' : 'Clearing...'}
              </>
            ) : clearSuccess ? (
              <>
                <Check className="h-4 w-4" />
                {locale === 'ar' ? 'تم المسح!' : 'Cleared!'}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {locale === 'ar' ? 'مسح الذاكرة المؤقتة' : 'Clear Cache'}
              </>
            )}
          </button>

          {/* Force Refresh Button */}
          <button
            onClick={handleForceRefresh}
            disabled={isRefreshing}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {locale === 'ar' ? 'جاري التحديث...' : 'Refreshing...'}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {locale === 'ar' ? 'إعادة تحميل البيانات' : 'Force Refresh Data'}
              </>
            )}
          </button>
        </div>

        {clearSuccess && (
          <p className="mt-3 text-sm text-green-600 dark:text-green-400">
            {locale === 'ar'
              ? 'سيتم إعادة تحميل الصفحة...'
              : 'Page will reload...'}
          </p>
        )}
      </div>
    </div>
  );
}
