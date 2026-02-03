import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, type Locale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const resolvedLocale = locale && locales.includes(locale as Locale) ? locale : defaultLocale;

  return {
    messages: (await import(`./messages/${resolvedLocale}.json`)).default,
    locale: resolvedLocale,
  };
});
