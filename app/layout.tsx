import { cookies } from 'next/headers'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cairo, Tajawal } from 'next/font/google'
import { CompareBar } from '@/components/compare-bar'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/lib/i18n/language-provider'
import { LOCALE_COOKIE } from '@/lib/i18n/language-provider'
import type { Locale } from '@/lib/i18n/dictionary'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
})

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://abdougsm.com'),

  title: {
    default: 'ABDOU GSM',
    template: '%s | ABDOU GSM',
  },

  description:
    'اكتشف أفضل الهواتف الذكية في الجزائر، قارن المواصفات والأسعار واختر الهاتف المناسب لك.',

  keywords: [
    'هواتف',
    'هواتف الجزائر',
    'مقارنة الهواتف',
    'أسعار الهواتف',
    'Android',
    'iPhone',
    'ABDOU GSM',
  ],

  authors: [{ name: 'ABDOU GSM' }],

  creator: 'ABDOU GSM',

  publisher: 'ABDOU GSM',

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: 'ABDOU GSM',
    description: 'اكتشف أفضل الهواتف الذكية في الجزائر وقارن بينها بسهولة.',
    url: 'https://abdougsm.com',
    siteName: 'ABDOU GSM',
    locale: 'ar_DZ',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ABDOU GSM',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'ABDOU GSM',
    description: 'اكتشف أفضل الهواتف الذكية في الجزائر.',
    images: ['/og-image.jpg'],
  },

  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  // Was hardcoded to 'dark' — now that both themes exist, let the browser
  // pick its native UI (scrollbars, form controls) based on whichever
  // theme actually ends up applied.
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1e' },
  ],
  userScalable: true,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Read the saved language preference on the server so the very first
  // response already has the correct lang/dir — no flash of the wrong
  // direction while the client JS boots up.
  const cookieStore = await cookies()
  const locale: Locale = cookieStore.get(LOCALE_COOKIE)?.value === 'en' ? 'en' : 'ar'
  const dir = locale === 'en' ? 'ltr' : 'rtl'

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${cairo.variable} ${tajawal.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background font-sans text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <LanguageProvider initialLocale={locale}>
            {children}
            <CompareBar />
          </LanguageProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}