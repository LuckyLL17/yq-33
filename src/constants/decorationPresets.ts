import type { DecorationPreset, DecorationCategory } from '@/types'

const tapeYlw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" preserveAspectRatio="none">
  <defs>
    <linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff4b8" stop-opacity="0.95"/>
      <stop offset="50%" stop-color="#ffe066" stop-opacity="0.92"/>
      <stop offset="100%" stop-color="#f5c842" stop-opacity="0.95"/>
    </linearGradient>
  </defs>
  <path d="M2,8 L198,5 L196,52 L4,55 Z" fill="url(#tg1)" opacity="0.88"/>
  <path d="M2,8 L198,5 L196,52 L4,55 Z" fill="none" stroke="#e6b83a" stroke-width="0.8" opacity="0.4"/>
  <g opacity="0.35">
    <line x1="10" y1="15" x2="30" y2="14" stroke="#c99a1e" stroke-width="0.6"/>
    <line x1="50" y1="40" x2="75" y2="42" stroke="#c99a1e" stroke-width="0.5"/>
    <line x1="100" y1="18" x2="125" y2="20" stroke="#c99a1e" stroke-width="0.6"/>
    <line x1="150" y1="45" x2="175" y2="43" stroke="#c99a1e" stroke-width="0.5"/>
  </g>
</svg>`

const tapePink = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" preserveAspectRatio="none">
  <defs>
    <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffd6e0" stop-opacity="0.95"/>
      <stop offset="50%" stop-color="#ff9eb5" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#ff7a99" stop-opacity="0.93"/>
    </linearGradient>
  </defs>
  <path d="M3,6 L197,9 L195,54 L5,51 Z" fill="url(#tg2)" opacity="0.85"/>
  <path d="M3,6 L197,9 L195,54 L5,51 Z" fill="none" stroke="#e85d7e" stroke-width="0.8" opacity="0.4"/>
  <g opacity="0.3">
    <line x1="20" y1="20" x2="45" y2="22" stroke="#cc4565" stroke-width="0.6"/>
    <line x1="80" y1="35" x2="110" y2="33" stroke="#cc4565" stroke-width="0.5"/>
    <line x1="140" y1="25" x2="165" y2="27" stroke="#cc4565" stroke-width="0.6"/>
  </g>
</svg>`

const tapeBlue = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" preserveAspectRatio="none">
  <defs>
    <linearGradient id="tg3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d6ecff" stop-opacity="0.95"/>
      <stop offset="50%" stop-color="#9ecfff" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#6fb0ff" stop-opacity="0.93"/>
    </linearGradient>
  </defs>
  <path d="M4,7 L196,6 L197,53 L3,54 Z" fill="url(#tg3)" opacity="0.85"/>
  <path d="M4,7 L196,6 L197,53 L3,54 Z" fill="none" stroke="#3d8de0" stroke-width="0.8" opacity="0.4"/>
  <g opacity="0.3">
    <line x1="15" y1="25" x2="40" y2="23" stroke="#2e73c2" stroke-width="0.6"/>
    <line x1="70" y1="42" x2="95" y2="44" stroke="#2e73c2" stroke-width="0.5"/>
    <line x1="130" y1="30" x2="155" y2="28" stroke="#2e73c2" stroke-width="0.6"/>
  </g>
</svg>`

const tapeGreen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" preserveAspectRatio="none">
  <defs>
    <linearGradient id="tg4" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d6f5d6" stop-opacity="0.95"/>
      <stop offset="50%" stop-color="#8dd98d" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#5ab85a" stop-opacity="0.93"/>
    </linearGradient>
  </defs>
  <path d="M2,9 L198,7 L196,51 L4,54 Z" fill="url(#tg4)" opacity="0.85"/>
  <path d="M2,9 L198,7 L196,51 L4,54 Z" fill="none" stroke="#3d9a3d" stroke-width="0.8" opacity="0.4"/>
</svg>`

const tapeWashi = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" preserveAspectRatio="none">
  <defs>
    <pattern id="wp" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.2" fill="#c98a7d" opacity="0.6"/>
      <circle cx="9" cy="9" r="1" fill="#d4a89c" opacity="0.5"/>
    </pattern>
  </defs>
  <rect x="2" y="5" width="196" height="50" fill="#fff0e8" opacity="0.9" rx="1"/>
  <rect x="2" y="5" width="196" height="50" fill="url(#wp)" opacity="0.75"/>
  <path d="M2,5 L198,5" stroke="#d9bcb0" stroke-width="0.6" opacity="0.5"/>
  <path d="M2,55 L198,55" stroke="#d9bcb0" stroke-width="0.6" opacity="0.5"/>
</svg>`

const heartSticker = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="hg" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ff8fa3"/>
      <stop offset="60%" stop-color="#e84c6d"/>
      <stop offset="100%" stop-color="#c23251"/>
    </radialGradient>
    <filter id="hs"><feGaussianBlur stdDeviation="0.8"/></filter>
  </defs>
  <path d="M50,85 C15,65 8,40 25,25 C38,13 50,22 50,32 C50,22 62,13 75,25 C92,40 85,65 50,85 Z"
    fill="url(#hg)" stroke="#9e2743" stroke-width="1.2"/>
  <ellipse cx="38" cy="33" rx="8" ry="5" fill="#ffffff" opacity="0.45"/>
  <circle cx="35" cy="30" r="2.5" fill="#ffffff" opacity="0.7"/>
</svg>`

const starSticker = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffe066"/>
      <stop offset="50%" stop-color="#ffb800"/>
      <stop offset="100%" stop-color="#e69500"/>
    </linearGradient>
  </defs>
  <path d="M50,8 L61,37 L92,40 L68,60 L76,90 L50,74 L24,90 L32,60 L8,40 L39,37 Z"
    fill="url(#sg)" stroke="#b87b00" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M50,15 L57,35 L50,32 L43,35 Z" fill="#ffffff" opacity="0.4"/>
</svg>`

const flowerSticker = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="fg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffd1dc"/>
      <stop offset="100%" stop-color="#ff8aa8"/>
    </radialGradient>
  </defs>
  <g transform="translate(50,50)">
    <ellipse cx="0" cy="-25" rx="13" ry="20" fill="url(#fg)" stroke="#e05b81" stroke-width="1"/>
    <ellipse cx="24" cy="-8" rx="13" ry="20" fill="url(#fg)" stroke="#e05b81" stroke-width="1" transform="rotate(72)"/>
    <ellipse cx="15" cy="20" rx="13" ry="20" fill="url(#fg)" stroke="#e05b81" stroke-width="1" transform="rotate(144)"/>
    <ellipse cx="-15" cy="20" rx="13" ry="20" fill="url(#fg)" stroke="#e05b81" stroke-width="1" transform="rotate(216)"/>
    <ellipse cx="-24" cy="-8" rx="13" ry="20" fill="url(#fg)" stroke="#e05b81" stroke-width="1" transform="rotate(288)"/>
    <circle cx="0" cy="0" r="11" fill="#ffd700" stroke="#c99a1e" stroke-width="1.2"/>
    <circle cx="-3" cy="-2" r="2" fill="#ffffff" opacity="0.6"/>
  </g>
</svg>`

const leafSticker = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8dd98d"/>
      <stop offset="100%" stop-color="#3d9a3d"/>
    </linearGradient>
  </defs>
  <path d="M15,85 Q10,45 50,10 Q85,30 88,75 Q55,95 15,85 Z"
    fill="url(#lg)" stroke="#2d7a2d" stroke-width="1.5"/>
  <path d="M18,82 Q45,55 82,25" fill="none" stroke="#2d7a2d" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M30,70 Q45,60 58,50" fill="none" stroke="#2d7a2d" stroke-width="1" opacity="0.7"/>
  <path d="M40,78 Q52,68 65,55" fill="none" stroke="#2d7a2d" stroke-width="1" opacity="0.7"/>
  <path d="M25,60 Q38,54 48,45" fill="none" stroke="#2d7a2d" stroke-width="1" opacity="0.7"/>
</svg>`

const cloverSticker = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="cg" cx="35%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#9fe09f"/>
      <stop offset="100%" stop-color="#4db34d"/>
    </radialGradient>
  </defs>
  <g transform="translate(50,55)">
    <path d="M0,-22 C-12,-35 -30,-30 -28,-12 C-26,4 -10,8 0,0 Z" fill="url(#cg)" stroke="#338a33" stroke-width="1"/>
    <path d="M22,0 C35,-12 30,-30 12,-28 C-4,-26 -8,-10 0,0 Z" fill="url(#cg)" stroke="#338a33" stroke-width="1"/>
    <path d="M0,22 C12,35 30,30 28,12 C26,-4 10,-8 0,0 Z" fill="url(#cg)" stroke="#338a33" stroke-width="1"/>
    <path d="M-22,0 C-35,12 -30,30 -12,28 C4,26 8,10 0,0 Z" fill="url(#cg)" stroke="#338a33" stroke-width="1"/>
    <circle cx="0" cy="0" r="4" fill="#338a33"/>
  </g>
  <path d="M50,78 Q48,88 52,95" fill="none" stroke="#338a33" stroke-width="2.5" stroke-linecap="round"/>
</svg>`

const roseFlower = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="rg1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff9eb5"/>
      <stop offset="100%" stop-color="#d43558"/>
    </radialGradient>
    <radialGradient id="rg2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffcfda"/>
      <stop offset="100%" stop-color="#ff7a99"/>
    </radialGradient>
  </defs>
  <g transform="translate(60,55)">
    <ellipse cx="0" cy="0" rx="32" ry="30" fill="url(#rg1)" stroke="#a82343" stroke-width="1.2"/>
    <ellipse cx="-10" cy="-5" rx="22" ry="18" fill="url(#rg2)" opacity="0.9"/>
    <ellipse cx="8" cy="5" rx="18" ry="15" fill="url(#rg2)" opacity="0.8"/>
    <ellipse cx="-2" cy="-8" rx="12" ry="10" fill="#ffe4ec" opacity="0.85"/>
    <ellipse cx="3" cy="-2" rx="6" ry="5" fill="#fff" opacity="0.5"/>
  </g>
  <path d="M60,82 Q58,98 62,115" fill="none" stroke="#338a33" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="48" cy="95" rx="10" ry="5" fill="#5ab85a" stroke="#338a33" stroke-width="1" transform="rotate(-30 48 95)"/>
  <ellipse cx="72" cy="102" rx="10" ry="5" fill="#5ab85a" stroke="#338a33" stroke-width="1" transform="rotate(30 72 102)"/>
</svg>`

const sunflower = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="sfg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffe066"/>
      <stop offset="100%" stop-color="#f0a000"/>
    </linearGradient>
  </defs>
  <g transform="translate(60,55)">
    <g>
      <ellipse cx="0" cy="-30" rx="8" ry="22" fill="url(#sfg)" stroke="#c97a00" stroke-width="0.8"/>
      <ellipse cx="0" cy="-30" rx="8" ry="22" fill="url(#sfg)" stroke="#c97a00" stroke-width="0.8" transform="rotate(30)"/>
      <ellipse cx="0" cy="-30" rx="8" ry="22" fill="url(#sfg)" stroke="#c97a00" stroke-width="0.8" transform="rotate(60)"/>
      <ellipse cx="0" cy="-30" rx="8" ry="22" fill="url(#sfg)" stroke="#c97a00" stroke-width="0.8" transform="rotate(90)"/>
      <ellipse cx="0" cy="-30" rx="8" ry="22" fill="url(#sfg)" stroke="#c97a00" stroke-width="0.8" transform="rotate(120)"/>
      <ellipse cx="0" cy="-30" rx="8" ry="22" fill="url(#sfg)" stroke="#c97a00" stroke-width="0.8" transform="rotate(150)"/>
      <ellipse cx="0" cy="-30" rx="8" ry="22" fill="url(#sfg)" stroke="#c97a00" stroke-width="0.8" transform="rotate(180)"/>
      <ellipse cx="0" cy="-30" rx="8" ry="22" fill="url(#sfg)" stroke="#c97a00" stroke-width="0.8" transform="rotate(210)"/>
      <ellipse cx="0" cy="-30" rx="8" ry="22" fill="url(#sfg)" stroke="#c97a00" stroke-width="0.8" transform="rotate(240)"/>
      <ellipse cx="0" cy="-30" rx="8" ry="22" fill="url(#sfg)" stroke="#c97a00" stroke-width="0.8" transform="rotate(270)"/>
      <ellipse cx="0" cy="-30" rx="8" ry="22" fill="url(#sfg)" stroke="#c97a00" stroke-width="0.8" transform="rotate(300)"/>
      <ellipse cx="0" cy="-30" rx="8" ry="22" fill="url(#sfg)" stroke="#c97a00" stroke-width="0.8" transform="rotate(330)"/>
    </g>
    <circle cx="0" cy="0" r="16" fill="#6b4226" stroke="#4a2d18" stroke-width="1.2"/>
    <g fill="#3d2410">
      <circle cx="-6" cy="-4" r="1.5"/>
      <circle cx="4" cy="-6" r="1.5"/>
      <circle cx="7" cy="3" r="1.5"/>
      <circle cx="-3" cy="7" r="1.5"/>
      <circle cx="0" cy="0" r="1.2"/>
    </g>
  </g>
  <path d="M60,82 Q58,100 62,116" fill="none" stroke="#338a33" stroke-width="3" stroke-linecap="round"/>
</svg>`

const cherryBlossom = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="cbg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff0f5"/>
      <stop offset="70%" stop-color="#ffc0d0"/>
      <stop offset="100%" stop-color="#ff9eb5"/>
    </radialGradient>
  </defs>
  <g transform="translate(50,50)">
    <ellipse cx="0" cy="-22" rx="14" ry="18" fill="url(#cbg)" stroke="#e890a8" stroke-width="0.8"/>
    <ellipse cx="21" cy="-7" rx="14" ry="18" fill="url(#cbg)" stroke="#e890a8" stroke-width="0.8" transform="rotate(72)"/>
    <ellipse cx="13" cy="18" rx="14" ry="18" fill="url(#cbg)" stroke="#e890a8" stroke-width="0.8" transform="rotate(144)"/>
    <ellipse cx="-13" cy="18" rx="14" ry="18" fill="url(#cbg)" stroke="#e890a8" stroke-width="0.8" transform="rotate(216)"/>
    <ellipse cx="-21" cy="-7" rx="14" ry="18" fill="url(#cbg)" stroke="#e890a8" stroke-width="0.8" transform="rotate(288)"/>
    <circle cx="0" cy="0" r="6" fill="#ffd700"/>
    <g fill="#e6a800">
      <circle cx="0" cy="-2" r="1"/>
      <circle cx="2" cy="1" r="0.8"/>
      <circle cx="-2" cy="1" r="0.8"/>
    </g>
  </g>
</svg>`

const tulip = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120">
  <defs>
    <linearGradient id="tug" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ff6b8a"/>
      <stop offset="100%" stop-color="#d43558"/>
    </linearGradient>
  </defs>
  <g transform="translate(40,35)">
    <path d="M-18,0 C-20,-25 -8,-35 0,-32 C8,-35 20,-25 18,0 C15,15 -15,15 -18,0 Z"
      fill="url(#tug)" stroke="#a82343" stroke-width="1.2"/>
    <path d="M-5,-30 C-3,-15 -2,-5 0,0" fill="none" stroke="#fff0f5" stroke-width="1.5" opacity="0.5"/>
    <path d="M5,-28 C4,-16 3,-6 0,0" fill="none" stroke="#fff0f5" stroke-width="1.2" opacity="0.4"/>
  </g>
  <path d="M40,45 Q38,80 42,115" fill="none" stroke="#338a33" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="28" cy="75" rx="12" ry="5" fill="#5ab85a" stroke="#338a33" stroke-width="1" transform="rotate(-35 28 75)"/>
  <ellipse cx="52" cy="85" rx="12" ry="5" fill="#5ab85a" stroke="#338a33" stroke-width="1" transform="rotate(35 52 85)"/>
</svg>`

const waxSeal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="wxg" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#e0554a"/>
      <stop offset="50%" stop-color="#b53025"/>
      <stop offset="100%" stop-color="#8b1a12"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="38" fill="url(#wxg)" stroke="#5e0e08" stroke-width="1.5"/>
  <circle cx="50" cy="50" r="32" fill="none" stroke="#ffd4cf" stroke-width="0.8" opacity="0.5"/>
  <g opacity="0.35" fill="#ffffff">
    <ellipse cx="38" cy="35" rx="10" ry="5"/>
    <circle cx="35" cy="32" r="3"/>
  </g>
  <g transform="translate(50,50)" fill="#ffd4cf" opacity="0.9">
    <path d="M-8,-8 L8,-8 L0,8 Z" stroke="#5e0e08" stroke-width="0.8" stroke-linejoin="round"/>
    <circle cx="0" cy="-1" r="1.5" fill="#5e0e08"/>
  </g>
</svg>`

const postageStamp = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
  <defs>
    <pattern id="sp" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="3" fill="#fffdf5"/>
    </pattern>
    <linearGradient id="spg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e8d8b0"/>
      <stop offset="100%" stop-color="#c9a878"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="92" height="112" fill="url(#sp)" rx="2"/>
  <rect x="10" y="10" width="80" height="100" fill="#fffdf5" stroke="#8b6914" stroke-width="1.2"/>
  <rect x="14" y="14" width="72" height="92" fill="none" stroke="#c9a878" stroke-width="0.8" stroke-dasharray="2,2"/>
  <g transform="translate(50,60)">
    <circle cx="0" cy="-8" r="12" fill="#f0a000" stroke="#8b6914" stroke-width="1"/>
    <g fill="#8b6914">
      <circle cx="0" cy="-8" r="2"/>
      <line x1="-4" y1="-14" x2="4" y2="-2" stroke-width="1"/>
      <line x1="4" y1="-14" x2="-4" y2="-2" stroke-width="1"/>
    </g>
    <rect x="-18" y="10" width="36" height="3" fill="#5ab85a"/>
    <rect x="-20" y="15" width="40" height="2" fill="#5ab85a"/>
  </g>
  <text x="50" y="100" text-anchor="middle" font-family="serif" font-size="10" fill="#8b6914" font-weight="bold">80分</text>
</svg>`

const decoCorner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <defs>
    <linearGradient id="dcg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d4a060"/>
      <stop offset="100%" stop-color="#8b5a2b"/>
    </linearGradient>
  </defs>
  <path d="M5,5 Q5,40 40,40 Q5,40 5,75 Q5,5 40,5 Q5,5 5,5 Z" fill="url(#dcg)" opacity="0.6"/>
  <g stroke="#6b4226" stroke-width="1.2" fill="none" stroke-linecap="round">
    <path d="M10,10 Q10,35 35,35"/>
    <path d="M10,10 Q35,10 35,35"/>
    <path d="M12,18 Q20,25 25,18"/>
    <path d="M18,12 Q25,20 18,25"/>
  </g>
  <circle cx="12" cy="12" r="2" fill="#8b5a2b"/>
</svg>`

const floralCorner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="fcg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8dd98d"/>
      <stop offset="100%" stop-color="#4db34d"/>
    </linearGradient>
  </defs>
  <g transform="translate(10,10)">
    <path d="M0,0 Q30,10 45,30 Q55,45 70,50" fill="none" stroke="url(#fcg)" stroke-width="3" stroke-linecap="round"/>
    <g fill="#ff8aa8" stroke="#e05b81" stroke-width="0.8">
      <ellipse cx="20" cy="10" rx="6" ry="4" transform="rotate(-30 20 10)"/>
      <ellipse cx="25" cy="15" rx="5" ry="3.5" transform="rotate(-10 25 15)"/>
      <ellipse cx="15" cy="15" rx="5" ry="3.5" transform="rotate(-50 15 15)"/>
      <circle cx="22" cy="12" r="1.5" fill="#ffd700"/>
    </g>
    <g fill="#ff8aa8" stroke="#e05b81" stroke-width="0.8">
      <ellipse cx="55" cy="40" rx="6" ry="4" transform="rotate(20 55 40)"/>
      <ellipse cx="60" cy="45" rx="5" ry="3.5" transform="rotate(40 60 45)"/>
      <ellipse cx="50" cy="45" rx="5" ry="3.5" transform="rotate(0 50 45)"/>
      <circle cx="55" cy="42" r="1.5" fill="#ffd700"/>
    </g>
    <g fill="url(#fcg)" stroke="#338a33" stroke-width="0.6">
      <ellipse cx="38" cy="25" rx="5" ry="3" transform="rotate(45 38 25)"/>
      <ellipse cx="45" cy="32" rx="4" ry="2.5" transform="rotate(60 45 32)"/>
    </g>
  </g>
</svg>`

const ribbonBow = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
  <defs>
    <linearGradient id="rbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ff7a99"/>
      <stop offset="50%" stop-color="#e84c6d"/>
      <stop offset="100%" stop-color="#c23251"/>
    </linearGradient>
    <linearGradient id="rbg2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e84c6d"/>
      <stop offset="100%" stop-color="#ff9eb5"/>
    </linearGradient>
  </defs>
  <g transform="translate(60,40)">
    <path d="M0,0 C-25,-30 -55,-10 -50,15 C-45,30 -20,25 0,0 Z" fill="url(#rbg)" stroke="#9e2743" stroke-width="1"/>
    <path d="M0,0 C25,-30 55,-10 50,15 C45,30 20,25 0,0 Z" fill="url(#rbg)" stroke="#9e2743" stroke-width="1"/>
    <ellipse cx="0" cy="0" rx="10" ry="8" fill="url(#rbg2)" stroke="#9e2743" stroke-width="1.2"/>
    <path d="M-8,5 C-15,25 -25,40 -10,45 C0,48 5,30 0,8 Z" fill="url(#rbg)" stroke="#9e2743" stroke-width="1"/>
    <path d="M8,5 C15,25 25,40 10,45 C0,48 -5,30 0,8 Z" fill="url(#rbg)" stroke="#9e2743" stroke-width="1"/>
    <path d="M-30,0 C-40,-5 -45,-12 -38,-20" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.4"/>
    <path d="M30,0 C40,-5 45,-12 38,-20" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.4"/>
  </g>
</svg>`

const satinRibbon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40">
  <defs>
    <linearGradient id="srg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d4af37"/>
      <stop offset="30%" stop-color="#f5e6a8"/>
      <stop offset="50%" stop-color="#fff8dc"/>
      <stop offset="70%" stop-color="#f5e6a8"/>
      <stop offset="100%" stop-color="#b8941f"/>
    </linearGradient>
  </defs>
  <path d="M5,10 Q15,5 30,12 Q60,20 100,15 Q140,10 170,18 Q190,22 195,20 Q190,30 170,28 Q140,35 100,30 Q60,25 30,32 Q10,35 5,30 Z"
    fill="url(#srg)" stroke="#8b6914" stroke-width="0.8"/>
  <g opacity="0.4" fill="#ffffff">
    <path d="M30,14 Q50,12 70,16" stroke="#ffffff" stroke-width="0.6" fill="none"/>
    <path d="M110,16 Q140,14 160,18" stroke="#ffffff" stroke-width="0.6" fill="none"/>
  </g>
</svg>`

const blueRibbon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
  <defs>
    <linearGradient id="brg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4d94ff"/>
      <stop offset="50%" stop-color="#2e6bcc"/>
      <stop offset="100%" stop-color="#1a4a99"/>
    </linearGradient>
  </defs>
  <g transform="translate(50,50)">
    <path d="M-35,-20 L-5,-45 L5,-45 L35,-20 L25,0 L-25,0 Z" fill="url(#brg)" stroke="#0f3366" stroke-width="1.2"/>
    <circle cx="0" cy="-22" r="14" fill="#ffe066" stroke="#b87b00" stroke-width="1.5"/>
    <text x="0" y="-17" text-anchor="middle" font-family="serif" font-size="12" font-weight="bold" fill="#8b5a2b">1</text>
    <path d="M-25,0 L-30,45 L-15,40 L-5,5 L-25,0 Z" fill="url(#brg)" stroke="#0f3366" stroke-width="1"/>
    <path d="M25,0 L30,45 L15,40 L5,5 L25,0 Z" fill="url(#brg)" stroke="#0f3366" stroke-width="1"/>
  </g>
</svg>`

export const decorationCategories: { id: DecorationCategory; name: string; iconName: string }[] = [
  { id: 'tape', name: '胶带', iconName: 'TextCursor' },
  { id: 'sticker', name: '贴纸', iconName: 'Sticker' },
  { id: 'flower', name: '花卉', iconName: 'Flower2' },
  { id: 'stamp', name: '印章装饰', iconName: 'Stamp' },
  { id: 'corner', name: '角花', iconName: 'CornerDownRight' },
  { id: 'ribbon', name: '丝带', iconName: 'Gift' },
]

export const decorationPresets: DecorationPreset[] = [
  { id: 'tape-yellow', name: '黄色胶带', category: 'tape', svgContent: tapeYlw, defaultWidth: 180, defaultHeight: 50 },
  { id: 'tape-pink', name: '粉色胶带', category: 'tape', svgContent: tapePink, defaultWidth: 180, defaultHeight: 50 },
  { id: 'tape-blue', name: '蓝色胶带', category: 'tape', svgContent: tapeBlue, defaultWidth: 180, defaultHeight: 50 },
  { id: 'tape-green', name: '绿色胶带', category: 'tape', svgContent: tapeGreen, defaultWidth: 180, defaultHeight: 50 },
  { id: 'tape-washi', name: '和纸胶带', category: 'tape', svgContent: tapeWashi, defaultWidth: 180, defaultHeight: 50 },

  { id: 'sticker-heart', name: '爱心贴纸', category: 'sticker', svgContent: heartSticker, defaultWidth: 70, defaultHeight: 70 },
  { id: 'sticker-star', name: '星星贴纸', category: 'sticker', svgContent: starSticker, defaultWidth: 70, defaultHeight: 70 },
  { id: 'sticker-flower', name: '花朵贴纸', category: 'sticker', svgContent: flowerSticker, defaultWidth: 70, defaultHeight: 70 },
  { id: 'sticker-leaf', name: '绿叶贴纸', category: 'sticker', svgContent: leafSticker, defaultWidth: 70, defaultHeight: 70 },
  { id: 'sticker-clover', name: '四叶草', category: 'sticker', svgContent: cloverSticker, defaultWidth: 70, defaultHeight: 70 },

  { id: 'flower-rose', name: '玫瑰', category: 'flower', svgContent: roseFlower, defaultWidth: 90, defaultHeight: 90 },
  { id: 'flower-sunflower', name: '向日葵', category: 'flower', svgContent: sunflower, defaultWidth: 90, defaultHeight: 90 },
  { id: 'flower-sakura', name: '樱花', category: 'flower', svgContent: cherryBlossom, defaultWidth: 70, defaultHeight: 70 },
  { id: 'flower-tulip', name: '郁金香', category: 'flower', svgContent: tulip, defaultWidth: 60, defaultHeight: 90 },

  { id: 'stamp-wax', name: '火漆印章', category: 'stamp', svgContent: waxSeal, defaultWidth: 70, defaultHeight: 70 },
  { id: 'stamp-postage', name: '邮票装饰', category: 'stamp', svgContent: postageStamp, defaultWidth: 60, defaultHeight: 75 },

  { id: 'corner-deco', name: '复古角花', category: 'corner', svgContent: decoCorner, defaultWidth: 60, defaultHeight: 60 },
  { id: 'corner-floral', name: '花卉角饰', category: 'corner', svgContent: floralCorner, defaultWidth: 80, defaultHeight: 80 },

  { id: 'ribbon-bow', name: '蝴蝶结', category: 'ribbon', svgContent: ribbonBow, defaultWidth: 110, defaultHeight: 75 },
  { id: 'ribbon-satin', name: '金色缎带', category: 'ribbon', svgContent: satinRibbon, defaultWidth: 160, defaultHeight: 35 },
  { id: 'ribbon-blue', name: '蓝色绶带', category: 'ribbon', svgContent: blueRibbon, defaultWidth: 75, defaultHeight: 90 },
]
