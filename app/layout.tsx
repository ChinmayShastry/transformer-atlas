import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Serif, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexSerif = IBM_Plex_Serif({
  variable: "--font-plex-serif",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Transformer Atlas — Learn How Transformers Evolved",
  description:
    "An interactive, visual walkthrough of how Transformers evolved: from RNNs and LSTMs, through attention, to GPT-scale LLMs. Drag the sliders, watch the concepts change live.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexSerif.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Applies the stored theme before first paint. Without this the page
            renders in the system theme and then snaps, which is worse than
            either theme on its own. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem("transformer-atlas-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
