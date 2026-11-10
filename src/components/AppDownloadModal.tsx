import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  Globe,
  Share2,
  CheckCircle2,
  X,
  ExternalLink,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWebApp: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
  onOpenWebApp,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');
  const [showIOSSteps, setShowIOSSteps] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
          onOpenWebApp();
        }, 1200);
      }
    } else if (isIOS) {
      setShowIOSSteps(true);
    } else {
      // Browser doesn't support beforeinstallprompt or already installed
      setShowIOSSteps(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Download and Install Application"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="relative flex flex-col w-full max-w-xl bg-[#141824] border border-[#262c40] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh]">
        {/* Top Gradient Accent Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#1c2338] via-[#151a2a] to-[#121622] border-b border-[#242b3e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2962ff] to-[#0039cb] flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Install Futures Trading App
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-[#2962ff]/20 text-[#2962ff] rounded-full border border-[#2962ff]/30">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-[#8a92a6]">
                Choose your preferred way to run Binance USD-M Futures
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8a92a6] hover:text-white hover:bg-[#20273c] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option Tabs: Web Application (PWA) vs Android Native APK */}
        <div className="flex items-center p-2 bg-[#0e121c] border-b border-[#202638] gap-2">
          <button
            onClick={() => {
              setActiveTab('pwa');
              setShowIOSSteps(false);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-[#2962ff] text-white shadow-md shadow-blue-600/30'
                : 'text-[#8a92a6] hover:text-white hover:bg-[#181e2e]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Web App (PWA) · All Devices</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('apk');
              setShowIOSSteps(false);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-[#089981] text-white shadow-md shadow-emerald-600/30'
                : 'text-[#8a92a6] hover:text-white hover:bg-[#181e2e]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android APK (Native App)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {activeTab === 'pwa' ? (
            <div className="space-y-4">
              {/* Feature Highlights Banner */}
              <div className="p-4 rounded-xl bg-[#1b2234]/60 border border-[#28324a] space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2962ff]">
                  <Sparkles className="w-4 h-4" />
                  <span>Official Progressive Web App (PWA)</span>
                </div>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">
                  Install instantly to your phone home screen, tablet, or desktop with <strong>zero app store downloads</strong>. Launches in dedicated standalone fullscreen mode with offline data caching and fast live WebSocket streaming.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#94a3b8]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#089981] shrink-0" />
                    <span>Real-time Binance WebSocket</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#089981] shrink-0" />
                    <span>TradingView touch physics</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#089981] shrink-0" />
                    <span>All 800+ USD-M coins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#089981] shrink-0" />
                    <span>No storage space needed (&lt;1MB)</span>
                  </div>
                </div>
              </div>

              {/* Install Action Area */}
              {installSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-[#089981] mx-auto" />
                  <p className="text-sm font-bold text-white">Application Installed Successfully!</p>
                  <p className="text-xs text-emerald-400">Launching terminal...</p>
                </div>
              ) : isInstalled ? (
                <div className="p-4 rounded-xl bg-[#1a2336] border border-[#2b3956] text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-[#2962ff] mx-auto" />
                  <p className="text-xs font-semibold text-white">App is already installed on this device!</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenWebApp();
                    }}
                    className="w-full py-2.5 px-4 bg-[#2962ff] hover:bg-[#1e50db] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Launch Trading Platform
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleInstallPWA}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#2962ff] to-[#1e50db] hover:from-[#1e50db] hover:to-[#1740ba] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Web App to Home Screen</span>
                  </button>

                  {/* Manual Instructions for iOS Safari & Chrome Desktop */}
                  {showIOSSteps || isIOS ? (
                    <div className="p-3.5 bg-[#10141f] border border-[#222a3d] rounded-xl text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400">
                        <Share2 className="w-3.5 h-3.5" />
                        <span>iPhone / iPad / Desktop Manual Installation:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-[#cbd5e1] text-[11.5px] leading-relaxed">
                        <li>
                          On <strong>iOS Safari</strong>: Tap the <span className="font-semibold text-white">Share</span> button (box with upward arrow) in the browser bottom bar.
                        </li>
                        <li>
                          Scroll down and tap <span className="font-semibold text-white">Add to Home Screen</span>.
                        </li>
                        <li>
                          On <strong>Chrome/Edge (PC/Mac)</strong>: Click the install icon in the URL address bar or select <span className="font-semibold text-white">Install App</span> from the browser menu.
                        </li>
                      </ol>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowIOSSteps(true)}
                      className="w-full text-center text-[11px] text-[#8a92a6] hover:text-[#2962ff] transition-colors py-1 cursor-pointer"
                    >
                      Using iOS Safari or Desktop Chrome? View manual steps →
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Android Native APK Info */}
              <div className="p-4 rounded-xl bg-[#1b2234]/60 border border-[#28324a] space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#089981]">
                  <Smartphone className="w-4 h-4" />
                  <span>Native Android App (Jetpack Compose APK)</span>
                </div>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">
                  The complete Android Kotlin application is located directly inside the <code className="px-1.5 py-0.5 rounded bg-[#101420] text-blue-400 font-mono">android/</code> directory of this repository, automated with GitHub Actions.
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="p-3 rounded-lg bg-[#111624] border border-[#222b42] space-y-1">
                    <span className="font-semibold text-white block">Repository:</span>
                    <a
                      href="https://github.com/surajali1026/surajnewchart"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-mono text-[11px] break-all"
                    >
                      <span>github.com/surajali1026/surajnewchart</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-3 rounded-lg bg-[#111624] border border-[#222b42] space-y-1 text-[11px] text-[#94a3b8]">
                    <span className="font-bold text-white block">How to download &amp; install APK:</span>
                    <p>1. Open GitHub repository Actions tab: <a href="https://github.com/surajali1026/surajnewchart/actions" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Build Android Debug APK</a>.</p>
                    <p>2. Download the compiled <code className="text-emerald-400">app-debug.apk</code> artifact.</p>
                    <p>3. Tap to install on your Android device (enable "Install Unknown Apps" if prompted).</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5">
                <a
                  href="https://github.com/surajali1026/surajnewchart/actions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#089981] to-[#056656] hover:from-[#0aab90] hover:to-[#067a67] text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download APK (GitHub Actions)</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#0e121c] border-t border-[#202638] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8a92a6]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#089981]" />
            <span>Secure &amp; Direct Binance API connection</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenWebApp();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-[#2962ff] hover:text-[#5282ff] transition-colors cursor-pointer"
          >
            <span>Continue to Web Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
