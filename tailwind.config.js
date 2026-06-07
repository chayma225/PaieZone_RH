/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/main/webapp/**/*.{html,ts}'],
  theme: {
    extend: {
      keyframes: {
        // ── Hero entry ──────────────────────────────────────────────
        heroFade: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        heroSlideRight: {
          '0%': { opacity: '0', transform: 'translateX(40px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateX(0)  scale(1)' },
        },
        heroSlideLeft: {
          '0%': { opacity: '0', transform: 'translateX(-32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        // Word-curtain : clip-path reveal
        curtain: {
          '0%': { clipPath: 'inset(0 100% 0 0)', opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { clipPath: 'inset(0 0% 0 0)', opacity: '1' },
        },

        // ── Orbes flottants ─────────────────────────────────────────
        orbDrift1: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(40px,-25px) scale(1.06)' },
          '66%': { transform: 'translate(-20px,30px) scale(0.96)' },
        },
        orbDrift2: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '40%': { transform: 'translate(-35px,20px) scale(1.08)' },
          '70%': { transform: 'translate(25px,-15px) scale(0.97)' },
        },
        orbDrift3: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(20px,40px) scale(1.04)' },
        },

        // ── Float chip ──────────────────────────────────────────────
        floatChip: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-9px)' },
        },
        floatChip2: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },

        // ── Staggered row reveal ─────────────────────────────────────
        rowReveal: {
          '0%': { opacity: '0', transform: 'translateY(12px)', clipPath: 'inset(0 0 100% 0)' },
          '100%': { opacity: '1', transform: 'translateY(0)', clipPath: 'inset(0 0 0% 0)' },
        },

        // ── Shimmer sweep ────────────────────────────────────────────
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },

        // ── Chatbot breathing ────────────────────────────────────────
        breathe: {
          '0%,100%': { transform: 'scale(1)', boxShadow: '0 4px 24px rgba(79,70,229,.42)' },
          '50%': { transform: 'scale(1.04)', boxShadow: '0 6px 32px rgba(79,70,229,.62)' },
        },
        chatPop: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.88) translateY(20px)',
            transformOrigin: 'bottom right',
            clipPath: 'inset(0 0 100% 100%)',
          },
          '60%': { clipPath: 'inset(0 0 0% 0%)' },
          '100%': { opacity: '1', transform: 'scale(1)   translateY(0)', clipPath: 'inset(0 0 0% 0%)' },
        },

        // ── Modal cinematic ──────────────────────────────────────────
        modalIn: {
          '0%': { opacity: '0', transform: 'scale(0.91) translateY(18px)' },
          '60%': { transform: 'scale(1.01) translateY(-2px)' },
          '100%': { opacity: '1', transform: 'scale(1)    translateY(0)' },
        },
        backdropIn: {
          '0%': { opacity: '0', backdropFilter: 'blur(0px)' },
          '100%': { opacity: '1', backdropFilter: 'blur(8px)' },
        },

        // ── KPI counter roll ─────────────────────────────────────────
        countUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },

        // ── Pulse dot ────────────────────────────────────────────────
        livePulse: {
          '0%,100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.18)', opacity: '0.7' },
        },
      },
      animation: {
        'hero-fade': 'heroFade .7s cubic-bezier(.22,1,.36,1) both',
        'hero-right': 'heroSlideRight .8s cubic-bezier(.22,1,.36,1) both',
        'hero-left': 'heroSlideLeft .6s cubic-bezier(.22,1,.36,1) both',
        curtain: 'curtain .6s cubic-bezier(.22,1,.36,1) both',
        'orb-1': 'orbDrift1 18s ease-in-out infinite',
        'orb-2': 'orbDrift2 23s ease-in-out infinite',
        'orb-3': 'orbDrift3 14s ease-in-out infinite',
        'float-chip': 'floatChip 3.5s ease-in-out infinite',
        'float-chip2': 'floatChip2 4.2s ease-in-out infinite',
        'row-reveal': 'rowReveal .4s cubic-bezier(.22,1,.36,1) both',
        shimmer: 'shimmer 2.2s linear infinite',
        breathe: 'breathe 3.5s ease-in-out infinite',
        'chat-pop': 'chatPop .35s cubic-bezier(.34,1.56,.64,1) both',
        'modal-in': 'modalIn .3s cubic-bezier(.34,1.56,.64,1) both',
        'backdrop-in': 'backdropIn .25s ease both',
        'count-up': 'countUp .5s cubic-bezier(.22,1,.36,1) both',
        'live-pulse': 'livePulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
