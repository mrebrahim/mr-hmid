import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { RTLProvider } from '@/components/layout/rtl-provider';
import { localeDirection, type Locale } from '@/lib/i18n/config';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dental Clinic Management',
  description: 'Dental clinic appointment management system',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();
  const direction = localeDirection[locale] || 'rtl';

  return (
    <html lang={locale} dir={direction}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <RTLProvider>{children}</RTLProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
