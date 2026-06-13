import type { FontPreset, PaperPreset } from '@/store/useWorkspaceStore'

export const fontPresets: FontPreset[] = [
  {
    id: 'mashanzheng',
    name: '马善政楷',
    fontFamily: '"Ma Shan Zheng", "楷体", "KaiTi", cursive',
    preview: '手写春风十里',
  },
  {
    id: 'zhimangxing',
    name: '植芒行书',
    fontFamily: '"Zhi Mang Xing", "华文行楷", cursive',
    preview: '行云流水',
  },
  {
    id: 'liujianmaocao',
    name: '刘建毛草',
    fontFamily: '"Liu Jian Mao Cao", "草书", cursive',
    preview: '草书意',
  },
  {
    id: 'longcang',
    name: '龙藏毛笔',
    fontFamily: '"Long Cang", "行楷", cursive',
    preview: '龙藏笔意',
  },
  {
    id: 'chenyuluoyan',
    name: '沉鱼落雁',
    fontFamily: '"Chen Yu Luo Yan", "楷体", cursive',
    preview: '婉约笔迹',
  },
  {
    id: 'caveat',
    name: '英文速写',
    fontFamily: '"Caveat", "Patrick Hand", cursive',
    preview: 'Handwritten',
  },
  {
    id: 'dancing',
    name: '圆体手写',
    fontFamily: '"Dancing Script", cursive',
    preview: 'Hello!',
  },
  {
    id: 'homemade',
    name: '苹果手书',
    fontFamily: '"Homemade Apple", cursive',
    preview: 'Sincerely',
  },
]

export const paperPresets: PaperPreset[] = [
  {
    id: 'blank',
    name: '空白纸',
    bgColor: '#ffffff',
    lineColor: '#ffffff',
    lineSpacing: 32,
    hasLines: false,
    hasMargin: false,
  },
  {
    id: 'line',
    name: '横线纸',
    bgColor: '#fdfdfd',
    lineColor: '#d0d0d0',
    lineSpacing: 32,
    hasLines: true,
    hasMargin: false,
  },
  {
    id: 'grid',
    name: '方格纸',
    bgColor: '#fdf6e3',
    lineColor: '#e8d8b0',
    lineSpacing: 32,
    hasLines: true,
    hasMargin: true,
  },
  {
    id: 'squared',
    name: '田字格',
    bgColor: '#fff8e7',
    lineColor: '#f0c97a',
    lineSpacing: 40,
    hasLines: true,
    hasMargin: true,
  },
  {
    id: 'notebook',
    name: '记事本',
    bgColor: '#f5f5dc',
    lineColor: '#b8b89e',
    lineSpacing: 28,
    hasLines: true,
    hasMargin: true,
  },
  {
    id: 'kraft',
    name: '牛皮纸',
    bgColor: '#c9a67a',
    lineColor: '#8b6b4a',
    lineSpacing: 32,
    hasLines: false,
    hasMargin: false,
  },
  {
    id: 'newspaper',
    name: '复古纸张',
    bgColor: '#f4ecd8',
    lineColor: '#c4b896',
    lineSpacing: 30,
    hasLines: false,
    hasMargin: false,
  },
]

export const sampleText = `那是一个阳光明媚的早晨，我独自漫步在公园的小径上。

微风轻轻拂过脸颊，带着淡淡的花香。路旁的梧桐树刚刚抽出嫩绿的新芽，鸟儿在枝头欢快地歌唱。

我走到湖边，看到几只天鹅正在水面上优雅地游动。它们时而低头觅食，时而舒展翅膀，在阳光下闪烁着洁白的光芒。

远处的草坪上，几个孩子正在追逐嬉戏，他们的笑声清脆悦耳，回荡在整个公园里。

这样的美好时光，让人不禁想起了童年的那些夏天——无忧无虑，充满欢笑。

生活中总会有这样或那样的烦恼，但此刻，我只想静静地享受这份宁静与美好。

愿每一天都能如此刻般温暖。`
