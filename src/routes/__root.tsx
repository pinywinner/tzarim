import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
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
      { name: "description", content: "מעקב צירים בבית — משך, מרווח וכלל 5-1-1, עד שיוצאים לחדר לידה." },
      { name: "theme-color", content: "#F3EEE6" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;600;700&family=Heebo:wght@400;500;600;700&display=swap",
      },
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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg">
      <p className="font-display text-3xl font-semibold tracking-tight text-fg">מעקב צירים</p>
      <p className="mt-2 text-sm text-muted">מעקב בבית, עד שיוצאים</p>
    </div>
  );
}

function AppFrame() {
  const hydrated = useAppStore((state) => state.hydrated);
  const onboardingDone = useAppStore((state) => state.onboardingDone);
  const stalePromptId = useAppStore((state) => state.stalePromptId);

  if (!hydrated) return <Splash />;

  const blocking = !onboardingDone || Boolean(stalePromptId);

  return (
    <>
      <div {...(blocking ? { inert: true } : {})}>
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
  );
}
