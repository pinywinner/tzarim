import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { LanguageSync } from "@/components/language-sync";
import { NativeBootstrap } from "@/components/native-bootstrap";
import { AppShell } from "@/components/app-shell";
import { Onboarding } from "@/components/onboarding";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { StaleDialog } from "@/components/stale-dialog";
import { ThemeSync } from "@/components/theme-sync";
import { AuthProvider } from "@/lib/auth/provider";
import { useAppStore } from "@/lib/store";
import { useT } from "@/hooks/use-t";
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

function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg">
      <p className="sr-only">{APP_NAME}</p>
      <svg viewBox="0 0 168 72" className="w-44 text-active" fill="none" aria-hidden="true">
        <path
          d="M10 52c26 0 34 0 48-24C68 12 74 8 84 8s16 4 26 20c14 24 22 24 48 24"
          stroke="currentColor"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function AppFrame() {
  const hydrated = useAppStore((state) => state.hydrated);
  const onboardingDone = useAppStore((state) => state.onboardingDone);
  const stalePromptId = useAppStore((state) => state.stalePromptId);
  const { dir } = useT();

  if (!hydrated) return <Splash />;

  const blocking = !onboardingDone || Boolean(stalePromptId);

  return (
    <>
      <div className="h-dvh overflow-hidden" {...(blocking ? { inert: true } : {})}>
        <AppShell>
          <Outlet />
        </AppShell>
      </div>
      {!onboardingDone ? <Onboarding /> : null}
      <StaleDialog />
      <Toaster
        position="top-center"
        dir={dir}
        toastOptions={{
          className: "font-sans !bg-elevated !text-fg !border-border",
        }}
      />
    </>
  );
}
