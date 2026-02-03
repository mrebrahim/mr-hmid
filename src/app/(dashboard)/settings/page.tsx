'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Settings, Wifi, WifiOff, Activity, Globe } from 'lucide-react';
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
    </div>
  );
}
