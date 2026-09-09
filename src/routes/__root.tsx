import { useCallback, useState } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { BrandIntro } from "@/components/brand-intro";
import { LanguageSync } from "@/components/language-sync";
import { NativeBootstrap } from "@/components/native-bootstrap";
import { AppShell } from "@/components/app-shell";
import { Onboarding } from "@/components/onboarding";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { StaleDialog } from "@/components/stale-dialog";
import { ThemeSync } from "@/components/theme-sync";
import { AuthProvider } from "@/lib/auth/provider";
import { useAppStore } from "@/lib/store";
import appCss from "../styles.css?url";

const APP_NAME = "מעקב צירים";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "application-name", content: APP_NAME },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "description", content: "בזמן צירים, כשקשה לחשוב — מה לעשות עכשיו. משך, מרווח, ומתי יוצאים לחדר לידה." },
      { name: "theme-color", content: "#F5F1EA" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "apple-touch-icon", href: "/icon-180.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="he" dir="rtl" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-canvas text-fg">
        <PreviewHostBridge />
        <AuthProvider>
          <ThemeSync />
          <LanguageSync />
          <NativeBootstrap />
          <AppFrame />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

function AppFrame() {
  const hydrated = useAppStore((state) => state.hydrated);
  const onboardingDone = useAppStore((state) => state.onboardingDone);
  const stalePromptId = useAppStore((state) => state.stalePromptId);
  const [intro, setIntro] = useState(true);
  const finishIntro = useCallback(() => setIntro(false), []);

  if (!hydrated && !intro) return <div className="h-dvh bg-bg" />;

  const blocking = !onboardingDone || Boolean(stalePromptId) || intro;

  return (
    <>
      {hydrated ? (
        <>
          <div className="h-dvh overflow-hidden" dir="rtl" {...(blocking ? { inert: true } : {})}>
            <AppShell>
              <Outlet />
            </AppShell>
          </div>
          {!onboardingDone ? <Onboarding /> : null}
          <StaleDialog />
          <Toaster
            position="top-center"
            dir="rtl"
            toastOptions={{
              className: "font-sans !bg-elevated !text-fg !border-border",
            }}
          />
        </>
      ) : (
        <div className="h-dvh bg-bg" />
      )}
      {intro ? <BrandIntro ready={hydrated} onDone={finishIntro} /> : null}
    </>
  );
}
