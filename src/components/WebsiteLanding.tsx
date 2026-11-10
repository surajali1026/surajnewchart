import React from 'react';
import { TradingPair } from '../types/trading';
import {
  Download,
  Smartphone,
  Globe,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface WebsiteLandingProps {
  pairs: TradingPair[];
  onOpenTradingApp: () => void;
  onOpenDownloadModal: () => void;
}

export const WebsiteLanding: React.FC<WebsiteLandingProps> = ({
  pairs,
  onOpenTradingApp,
  onOpenDownloadModal,
}) => {
  const topTickers = pairs.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#0e1118] text-white flex flex-col font-sans selection:bg-[#2962ff] selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#1f2638] bg-[#121622]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2962ff] to-[#0039cb] flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-400/40">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wider text-white">
                  BINANCE FUTURES
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[#2962ff] text-white rounded">
                  USD-M
                </span>
              </div>
              <p className="text-[10px] text-[#787b86] font-medium tracking-wide">
                TradingView Terminal &amp; Native Mobile Engine
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDownloadModal}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-[#1a2133] hover:bg-[#242e47] text-[#93c5fd] border border-[#2b3956] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#2962ff]" />
              <span>Download / Install App</span>
            </button>

            <button
              onClick={onOpenTradingApp}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-[#2962ff] to-[#1e50db] hover:from-[#3b72ff] hover:to-[#2256ee] text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer transform active:scale-95"
            >
              <span>Launch Live Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Live Market Ticker Marquee Strip */}
      <div className="w-full bg-[#141824] border-b border-[#1f2638] overflow-x-auto py-2 px-4 scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-xs whitespace-nowrap">
          <span className="flex items-center gap-1.5 font-bold text-[#787b86] text-[11px] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse" />
            Binance Live
          </span>

          {topTickers.length > 0 ? (
            topTickers.map((p) => {
              const isGain = p.priceChangePercent >= 0;
              return (
                <button
                  key={p.symbol}
                  onClick={onOpenTradingApp}
                  className="flex items-center gap-2 hover:bg-[#1a2133] px-2 py-0.5 rounded transition-colors cursor-pointer"
                >
                  <span className="font-bold text-white text-[11px]">{p.symbol}</span>
                  <span className="text-[11px] text-[#cbd5e1] font-mono">
                    ${p.price < 1 ? p.price.toFixed(4) : p.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-[10px] font-bold font-mono ${
                      isGain ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isGain ? '+' : ''}
                    {p.priceChangePercent.toFixed(2)}%
                  </span>
                </button>
              );
            })
          ) : (
            <span className="text-[#787b86] text-xs">Streaming real-time 800+ USD-M market contracts...</span>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[#1c2336]">
        {/* Glow Background blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[200px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a2236] border border-[#2b3858] text-[11px] font-semibold text-blue-400 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Dual Engine Architecture · Web Application (PWA) &amp; Android APK</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Professional TradingView Terminal for{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2962ff] via-[#4d82ff] to-[#089981]">
              Binance USD-M Futures
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
            Real-time live WebSocket candlestick charts, sub-pixel kinetic inertia touch physics, customizable alerts, drawing tools, and 800+ crypto perpetual pairs. Available as an installable Web Application (PWA) and Native Android APK in this repository.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onOpenTradingApp}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#2962ff] to-[#1e50db] hover:from-[#3870ff] hover:to-[#1746c8] text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Open Live Web Application</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onOpenDownloadModal}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#161d2d] hover:bg-[#1f2940] text-white border border-[#2b3856] font-bold text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download &amp; Install App</span>
            </button>
          </div>

          {/* App Specifications Bar */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#089981]" />
              <span>800+ USD-M Pairs (USDT &amp; USDC)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#089981]" />
              <span>TradingView Kinetic Touch Physics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#089981]" />
              <span>Binance WebSocket 100ms Ticker</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#089981]" />
              <span>Zero-Install PWA + Native APK</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 sm:py-20 bg-[#0e1118] border-b border-[#1c2336]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Engineered for Speed, Precision &amp; Portability
            </h2>
            <p className="text-xs sm:text-sm text-[#8a92a6]">
              Every tool and gesture optimized for professional crypto futures technical analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#131724] border border-[#20273a] hover:border-[#2b3652] transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">All 800+ Binance USD-M Coins</h3>
              <p className="text-xs text-[#8a92a6] leading-relaxed">
                Full access to all perpetual and delivery contracts across USDT and USDC with instant 1-click watchlist search, top 100 volume rankings, top gainers, and losers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#131724] border border-[#20273a] hover:border-[#2b3652] transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">TradingView Kinetic Momentum</h3>
              <p className="text-xs text-[#8a92a6] leading-relaxed">
                Ultra-smooth sub-pixel coordinate math, physics friction decay fling scrolling, two-finger pinch-to-zoom, and vertical price scale stretch/compress.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#131724] border border-[#20273a] hover:border-[#2b3652] transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Live Bar Countdown Timer</h3>
              <p className="text-xs text-[#8a92a6] leading-relaxed">
                Millisecond-synchronized countdown timer directly anchored under the active price tag, synced to Binance server clock for accurate candle close timing.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#131724] border border-[#20273a] hover:border-[#2b3652] transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Drawing Suite &amp; Price Alerts</h3>
              <p className="text-xs text-[#8a92a6] leading-relaxed">
                Trendlines, Horizontal support/resistance, Rectangles, and Price Ranges with percentage ROI calculator. Set price alert lines with audio and haptic alarms.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#131724] border border-[#20273a] hover:border-[#2b3652] transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Progressive Web App (PWA)</h3>
              <p className="text-xs text-[#8a92a6] leading-relaxed">
                Install as a standalone app directly from your browser on Android, iOS Safari, Windows, and Mac with offline asset caching and zero store delays.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#131724] border border-[#20273a] hover:border-[#2b3652] transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Native Android Jetpack Compose</h3>
              <p className="text-xs text-[#8a92a6] leading-relaxed">
                Source code includes the complete Kotlin Android app under <code className="text-rose-300 font-mono">android/</code> with automated GitHub Actions debug APK building.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Download Portal Section */}
      <section className="py-16 sm:py-20 bg-[#121622] border-b border-[#1c2336]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#181f32] to-[#121726] border border-[#263352] text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
              <Download className="w-3.5 h-3.5" />
              <span>Easy One-Click Installation</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Get the Application on Your Device
            </h2>

            <p className="text-xs sm:text-sm text-[#94a3b8] max-w-xl mx-auto leading-relaxed">
              Install the Progressive Web Application (PWA) for fast, store-free standalone charting on any phone or computer, or download the native Android Debug APK compiled directly from GitHub Actions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={onOpenDownloadModal}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#2962ff] hover:bg-[#1f50db] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>Install Web App (PWA)</span>
              </button>

              <a
                href="https://github.com/surajali1026/surajnewchart/actions"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#089981] hover:bg-[#07816d] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Download Android APK (GitHub)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onOpenTradingApp}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#1b2336] hover:bg-[#25304a] text-white border border-[#2c3a5a] font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                <span>Open in Browser</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#0c0e14] text-center text-xs text-[#64748b] space-y-2">
        <p className="font-medium">
          Binance Futures TradingView Platform · Built with React, TypeScript, Tailwind CSS, &amp; Android Jetpack Compose
        </p>
        <p className="text-[11px] text-[#475569]">
          Direct Binance USD-M WebSocket streams · No financial advice · High-performance charting engine
        </p>
      </footer>
    </div>
  );
};
