export type Look = {
  slug: string
  name: string
  number: string
  mood: string
  description: string
  story: string
  sample: 'corner-light' | 'coast-road' | 'citrus-table'
  colours: string[]
  matrix: number[]
  offset: number[]
  contrast: number
}
export const looks: Look[] = [
  {
    slug: 'cinder-200',
    name: 'Cinder 200',
    number: '01',
    mood: 'Warm light / Soft edges',
    description: 'A little warmth in the highlights. A softer place for the shadows to land.',
    story:
      'Cinder begins with a gentle warm shift and a quiet contrast curve. It likes sunlit walls, worn wood and the last light of a long afternoon. Dial it back when the original colour already says enough. This is an original digital colour recipe, not an emulation of a commercial film stock.',
    sample: 'corner-light',
    colours: ['#d8754b', '#e6cba7', '#4e5140'],
    matrix: [1.06, 0.02, 0, 0.01, 1.01, 0.01, 0, 0.02, 0.94],
    offset: [5, 1, -3],
    contrast: 0.96,
  },
  {
    slug: 'coast-400',
    name: 'Coast 400',
    number: '02',
    mood: 'Cool air / Open space',
    description: 'Quiet blues, a trace of green, and room for the light to move.',
    story:
      'Coast shifts the balance toward blue-green without turning the whole picture into a single colour. A mild contrast lift gives edges a little definition. Try it with open skies and pale concrete, then find the strength that still feels like your own photograph. The name is fictional; the effect is a simple reproducible RGB recipe.',
    sample: 'coast-road',
    colours: ['#557c83', '#a9b9ad', '#d9d3ba'],
    matrix: [0.94, 0.01, 0.02, 0, 1.02, 0.02, 0.01, 0.02, 1.06],
    offset: [-4, 2, 5],
    contrast: 1.03,
  },
  {
    slug: 'pearl-100',
    name: 'Pearl 100',
    number: '03',
    mood: 'Less colour / More shape',
    description: 'A monochrome study in texture, shape and the space between them.',
    story:
      'Pearl draws its brightness from weighted RGB luminance, then adds a small contrast lift. At full colour strength it produces equal red, green and blue channels. At lower strengths a little original colour remains. Grain is a separate control, so you can choose a clean monochrome image or add a modest texture.',
    sample: 'citrus-table',
    colours: ['#3c3b38', '#94938b', '#e8e3d8'],
    matrix: [0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722],
    offset: [2, 2, 2],
    contrast: 1.08,
  },
]
export const getLook = (slug: string) => looks.find((look) => look.slug === slug)
export const samples = [
  {
    id: 'corner-light',
    name: 'Corner light',
    alt: 'Warm afternoon light on an ochre street corner',
  },
  { id: 'coast-road', name: 'Coast road', alt: 'An empty coastal road beside a blue-green sea' },
  {
    id: 'citrus-table',
    name: 'Citrus table',
    alt: 'Oranges and a cream ceramic bowl on a pale blue table',
  },
]
