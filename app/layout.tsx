import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css'; // Global styles
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

export const metadata: Metadata = {
  metadataBase: new URL('https://lsi-imomushi-simulator.vercel.app'),
  title: {
    default: 'LSI芋虫育成シミュレーター | 規律と構造化のソシオニクス育成ゲーム',
    template: '%s | LSI芋虫育成シミュレーター'
  },
  description: 'Ti-Se（LSI/FVLE）の思考特性を持つ芋虫を育成・観察・規律訓練！不器用な論理芋虫との対話や生態観察、形態進化が楽しめる育成シミュレーター。',
  keywords: [
    'LSI芋虫',
    'LSI',
    'ソシオニクス',
    'MBTI',
    'ISTJ',
    'ISTP',
    '育成ゲーム',
    'シミュレーター',
    'FVLE',
    'Ti-Se',
    'ダーリンちゃん'
  ],
  authors: [{ name: 'LSI芋虫育成委員会' }],
  creator: 'LSI芋虫育成委員会',
  publisher: 'LSI芋虫育成委員会',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'LSI芋虫育成シミュレーター | 規律と構造化のソシオニクス育成ゲーム',
    description: 'Ti-Se（LSI/FVLE）の思考特性を持つ芋虫を育成・観察・規律訓練！不器用な論理芋虫との対話や生態観察、形態進化が楽しめる育成シミュレーター。',
    url: 'https://lsi-imomushi-simulator.vercel.app',
    siteName: 'LSI芋虫育成シミュレーター',
    images: [
      {
        url: 'https://lsi-imomushi-simulator.vercel.app/ogp.png',
        width: 1200,
        height: 630,
        alt: 'LSI芋虫育成シミュレーター',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LSI芋虫育成シミュレーター | 規律と構造化のソシオニクス育成ゲーム',
    description: 'Ti-Se（LSI/FVLE）の思考特性を持つ芋虫を育成・観察・規律訓練！不器用な論理芋虫との対話や生態観察、形態進化が楽しめる育成シミュレーター。',
    images: ['https://lsi-imomushi-simulator.vercel.app/ogp.png'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ja">
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GNTX973GET"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GNTX973GET');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
