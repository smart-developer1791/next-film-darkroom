import { getLook } from '@/data/looks'
import type { Recipe } from '@/domain/recipe'
export function recipeCard(recipe: Recipe) {
  const look = getLook(recipe.look)!
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        background: '#f5f1e8',
        color: '#282925',
        padding: 56,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22 }}>
        <span>softlight lab.</span>
        <span>COLOUR RECIPE / {look.number}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, letterSpacing: -5 }}>
          {look.name}
        </div>
        <div style={{ display: 'flex', fontSize: 24, marginTop: 12, color: '#63665b' }}>
          {look.mood}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 30 }}>
          {look.colours.map((colour) => (
            <div
              key={colour}
              style={{ display: 'flex', width: 350, height: 50, background: colour }}
            />
          ))}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderTop: '1px solid #d2cfc2',
          paddingTop: 24,
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24 }}>
          <span>{recipe.strength}% colour strength</span>
          <span>Grain {recipe.grain} / 20</span>
          <span>Original digital RGB</span>
        </div>
        <span style={{ fontSize: 18, color: '#63665b' }}>
          Settings only. Your photograph stays local.
        </span>
      </div>
    </div>
  )
}
