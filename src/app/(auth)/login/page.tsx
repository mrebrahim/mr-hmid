'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(t('auth.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('common.appName')}
          </h1>
          <p className="mt-2 text-muted-foreground">{t('auth.login')}</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none"
              >
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                  'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
                  'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                )}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none"
              >
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                  'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
                  'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                )}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
                'ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                'hover:bg-primary/90'
              )}
            >
              {isLoading ? t('common.loading') : t('auth.login')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
