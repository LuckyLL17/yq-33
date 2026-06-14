import type { FontPreset } from '../types';

export const builtInFonts: FontPreset[] = [
  {
    id: 'ma-shan-zheng',
    name: '马善政楷体',
    family: 'Ma Shan Zheng',
    previewText: '落霞与孤鹜齐飞，秋水共长天一色',
    category: 'cn',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: '"楷体", "KaiTi", cursive, serif',
  },
  {
    id: 'zhi-mang-xing',
    name: '植芒行书',
    family: 'Zhi Mang Xing',
    previewText: '人生若只如初见，何事秋风悲画扇',
    category: 'cn',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: '"华文行楷", cursive, serif',
  },
  {
    id: 'liu-jian-mao-cao',
    name: '刘建毛草',
    family: 'Liu Jian Mao Cao',
    previewText: '春风得意马蹄疾，一日看尽长安花',
    category: 'cn',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: '"草书", cursive, serif',
  },
  {
    id: 'long-cang',
    name: '龙藏毛笔',
    family: 'Long Cang',
    previewText: '山重水复疑无路，柳暗花明又一村',
    category: 'cn',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: '"行楷", cursive, serif',
  },
  {
    id: 'chen-yu-luo-yan',
    name: '沉鱼落雁',
    family: 'Chen Yu Luo Yan',
    previewText: '愿得一人心，白首不分离',
    category: 'cn',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: '"楷体", cursive, serif',
  },
  {
    id: 'zcool-kuaile',
    name: '站酷快乐体',
    family: 'ZCOOL KuaiLe',
    previewText: '生活不止眼前的苟且，还有诗和远方',
    category: 'cn',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: '"黑体", sans-serif',
  },
  {
    id: 'zcool-xiaowei',
    name: '站酷小薇体',
    family: 'ZCOOL XiaoWei',
    previewText: '愿你出走半生，归来仍是少年',
    category: 'cn',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: '"宋体", serif',
  },
  {
    id: 'caveat',
    name: 'Caveat速写',
    family: 'Caveat',
    previewText: 'The quick brown fox jumps over the lazy dog',
    category: 'en',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: 'cursive',
  },
  {
    id: 'patrick-hand',
    name: 'Patrick Hand',
    family: 'Patrick Hand',
    previewText: 'Writing is the painting of the voice',
    category: 'en',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: 'cursive',
  },
  {
    id: 'dancing-script',
    name: 'Dancing Script',
    family: 'Dancing Script',
    previewText: 'Life is what happens when you are busy making plans',
    category: 'en',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: 'cursive',
  },
  {
    id: 'homemade-apple',
    name: 'Homemade Apple',
    family: 'Homemade Apple',
    previewText: 'Stay hungry, stay foolish',
    category: 'en',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: 'cursive',
  },
  {
    id: 'indie-flower',
    name: 'Indie Flower',
    family: 'Indie Flower',
    previewText: 'To be yourself in a world that is constantly trying',
    category: 'en',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: 'cursive',
  },
  {
    id: 'caveat-brush',
    name: 'Caveat Brush',
    family: 'Caveat Brush',
    previewText: 'Bold and expressive handwriting style',
    category: 'en',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: 'cursive',
  },
  {
    id: 'amatic-sc',
    name: 'Amatic SC',
    family: 'Amatic SC',
    previewText: 'Simple and elegant handwritten letters',
    category: 'en',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: 'cursive',
  },
  {
    id: 'kalam',
    name: 'Kalam',
    family: 'Kalam',
    previewText: 'A natural handwriting feel for everyday notes',
    category: 'en',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: 'cursive',
  },
  {
    id: 'sriracha',
    name: 'Sriracha',
    family: 'Sriracha',
    previewText: 'Playful and bold hand lettering style',
    category: 'en',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: 'cursive',
  },
  {
    id: 'covered-by-your-grace',
    name: 'Covered By Your Grace',
    family: 'Covered By Your Grace',
    previewText: 'Casual and friendly handwritten font',
    category: 'en',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: 'cursive',
  },
  {
    id: 'swanky-and-moo-moo',
    name: 'Swanky and Moo Moo',
    family: 'Swanky and Moo Moo',
    previewText: 'Whimsical and charming handwritten type',
    category: 'en',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: 'cursive',
  },
  {
    id: 'coming-soon',
    name: 'Coming Soon',
    family: 'Coming Soon',
    previewText: 'Messy and authentic handwriting look',
    category: 'en',
    source: 'google',
    isBuiltIn: true,
    fallbackFonts: 'cursive',
  },
];

export const googleFontFamilies: string[] = [
  'Ma Shan Zheng',
  'Zhi Mang Xing',
  'Liu Jian Mao Cao',
  'Long Cang',
  'Chen Yu Luo Yan',
  'ZCOOL KuaiLe',
  'ZCOOL XiaoWei',
  'Caveat',
  'Patrick Hand',
  'Dancing Script',
  'Homemade Apple',
  'Indie Flower',
  'Caveat Brush',
  'Amatic SC',
  'Kalam',
  'Sriracha',
  'Covered By Your Grace',
  'Swanky and Moo Moo',
  'Coming Soon',
];

export function buildFontStack(font: FontPreset): string {
  const base = `"${font.family}"`;
  if (font.fallbackFonts) {
    return `${base}, ${font.fallbackFonts}`;
  }
  return base;
}

export function getFontById(id: string, customFonts: FontPreset[] = []): FontPreset | undefined {
  return builtInFonts.find((f) => f.id === id) || customFonts.find((f) => f.id === id);
}

export function getAllFonts(customFonts: FontPreset[] = []): FontPreset[] {
  return [...builtInFonts, ...customFonts];
}

export function filterFonts(
  fonts: FontPreset[],
  options: {
    category?: FontPreset['category'];
    source?: FontPreset['source'];
    search?: string;
  }
): FontPreset[] {
  return fonts.filter((font) => {
    if (options.category && font.category !== options.category) {
      return false;
    }
    if (options.source && font.source !== options.source) {
      return false;
    }
    if (options.search) {
      const query = options.search.toLowerCase();
      return (
        font.name.toLowerCase().includes(query) ||
        font.family.toLowerCase().includes(query) ||
        font.previewText.toLowerCase().includes(query)
      );
    }
    return true;
  });
}
