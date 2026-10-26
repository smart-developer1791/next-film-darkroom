import { ImageResponse } from 'next/og'
import { queryRecord, validateRecipe } from '@/domain/recipe'
import { recipeCard } from '@/lib/recipe-card'
export function GET(request: Request) {
  const params = new URL(request.url).searchParams
  let recipe
  try {
    recipe = validateRecipe(queryRecord(params))
  } catch {
    return Response.json({ error: 'A valid colour recipe is required.' }, { status: 400 })
  }
  const headers: Record<string, string> = {
    'Cache-Control': 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
  }
  if (params.get('download') === '1')
    headers['Content-Disposition'] = `attachment; filename="softlight-${recipe.look}-recipe.png"`
  return new ImageResponse(recipeCard(recipe), { width: 1200, height: 630, headers })
}
