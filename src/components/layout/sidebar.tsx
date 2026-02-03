'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Clock,
  MessageSquare,
  BookOpen,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/appointments', label: t('appointments'), icon: Calendar },
    { href: '/patients', label: t('patients'), icon: Users },
    { href: '/services', label: t('services'), icon: Stethoscope },
    { href: '/schedule', label: t('schedule'), icon: Clock },
    { href: '/conversations', label: t('conversations'), icon: MessageSquare },
    { href: '/knowledge-base', label: t('knowledgeBase'), icon: BookOpen },
    { href: '/settings', label: t('settings'), icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 start-0 z-50 w-64 border-e bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold">{t('dashboard')}</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
