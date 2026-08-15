import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css'; // Global styles
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

export const metadata: Metadata = {
  title: '🐛 LSI芋虫 育成・統制シミュレーター',
  description: 'LSI/FVLEの思考特性を持つ芋虫を育成・観察・規律訓練するシミュレーションゲーム。Googleスプレッドシート完全連携。',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ja">
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
