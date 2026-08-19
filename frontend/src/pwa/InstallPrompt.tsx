import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<PromptInstance>;
  userPrompted: boolean;
}

interface PromptInstance {
  outcome: 'accepted' | 'dismissed';
}

declare global {
  interface Window {
    // @ts-ignore — not in lib.dom
    beforeinstallprompt: (e: BeforeInstallPromptEvent) => void;
  }
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallUI, setShowInstallUI] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallUI(true);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);

    const installSuccess = () => {
      setInstalled(true);
      setShowInstallUI(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installSuccess as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
      window.removeEventListener('appinstalled', installSuccess as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    const { outcome } = await deferredPrompt.prompt();
    setShowInstallUI(false);
    if (outcome === 'accepted') {
      setInstalled(true);
    }
  };

  if (installed) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">App installed</span>
          <span className="text-emerald-200">DineConnect is on your home screen.</span>
        </div>
      </div>
    );
  }

  if (!showInstallUI || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Install DineConnect</h3>
            <p className="text-sm text-slate-400">Add to home screen</p>
          </div>
        </div>

        <p className="text-slate-300 text-sm mb-6">
          Add DineConnect to your home screen for instant access — no browser chrome.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleInstall}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors text-sm"
          >
            Install
          </button>
          <button
            onClick={() => setShowInstallUI(false)}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl transition-colors text-sm border border-slate-600"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
