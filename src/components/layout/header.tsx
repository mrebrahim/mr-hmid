'use client';

import { useTranslations } from 'next-intl';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export function Header() {
  const t = useTranslations();
  const { staff, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        {/* Page title can be passed as prop or context */}
      </div>

      <div className="flex items-center gap-4">
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
