"use client";

import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "pwa-install-banner-dismissed";

// This function checks if the PWA install banner has been dismissed by the user. It retrieves the value from localStorage using the STORAGE_KEY and returns true if the banner has been dismissed, otherwise it returns false.
function isBannerDismissed() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

// This function sets the dismissed state of the PWA install banner in localStorage.
// It takes a boolean value as an argument and stores it in localStorage using the STORAGE_KEY.
// If the value is true, it indicates that the banner has been dismissed; if false, it indicates that the banner is not dismissed.
function setBannerDismissed(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
}

// This function checks if the application is running in standalone mode, which indicates that it has been installed as a PWA.
// It checks the display mode using the window.matchMedia API and also checks the navigator.standalone property for compatibility with iOS devices.
// It returns true if the application is in standalone mode, otherwise it returns false.
function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || Boolean(nav.standalone);
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => isStandaloneMode());

// This useMemo hook checks if the PWA install banner has been dismissed by the user.
// It calls the isBannerDismissed function and memoizes the result, so it only recalculates when the component mounts or when the dependencies change.
// The result is stored in the isDismissed variable, which indicates whether the banner should be shown or not.
  const isDismissed = useMemo(() => isBannerDismissed(), []);

// This useEffect hook sets up event listeners for the "beforeinstallprompt" and "appinstalled" events when the component mounts.
// The "beforeinstallprompt" event is triggered when the browser detects that the app can be installed as a PWA.
// The handler prevents the default prompt and shows the custom install banner if it hasn't been dismissed or if the app is not already installed.
// The "appinstalled" event is triggered when the app is successfully installed, and it updates the state to reflect that the app is installed and hides the banner.
// The cleanup function removes the event listeners when the component unmounts to prevent memory leaks.
  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      if (isBannerDismissed()) {
        return;
      }
      if (isStandaloneMode()) {
        setIsInstalled(true);
        return;
      }
      setDeferredPrompt(promptEvent);
      setIsVisible(true);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setIsVisible(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (isInstalled || isDismissed || !isVisible || !deferredPrompt) {
    return null;
  }

//   This function handles the installation of the PWA when the user clicks the "Install" button on the banner.
//   It checks if the deferredPrompt is available, and if so, it calls the prompt method to show the installation prompt to the user.
//   After the user makes a choice, it checks the outcome of the userChoice promise. If the user accepted the installation, it hides the banner and sets the dismissed state in localStorage.
//   If the user dismissed the installation, it also hides the banner and sets the dismissed state in localStorage.
  async function handleInstall() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      setIsVisible(false);
      setBannerDismissed(true);
      setDeferredPrompt(null);
    } else {
      setIsVisible(false);
      setBannerDismissed(true);
    }
  }

  function handleCancel() {
    setIsVisible(false);
    setBannerDismissed(true);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-gray-300 bg-blue-100 p-4 shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex p-3 items-center justify-center rounded-3xl bg-orange-100 text-orange-700 border border-orange-200">
          <Download className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-slate-900">Install UNIZIK LMS</p>
          <p className="mt-1 text-[12px] text-slate-500">Get quick access from your home screen</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleCancel}
            className="inline-flex flex-1 items-center justify-center rounded-2xl text-slate-500 px-4 py-2 text-sm font-semibold transition hover:text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 text-[14px] cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 text-[14px] cursor-pointer"
        >
          Install
        </button>
      </div>
    </div>
  );
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>; 
    platforms: string[];
  }
}
