import { queryRecord, validateRecipe, recipeDocument } from '@/domain/recipe'
export function GET(request: Request) {
  try {
    const recipe = validateRecipe(queryRecord(new URL(request.url).searchParams))
    return new Response(JSON.stringify(recipeDocument(recipe), null, 2) + '\n', {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="softlight-${recipe.look}.json"`,
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return Response.json(
      { error: 'Provide one valid look, strength (0–100 in steps of 5) and grain (0–20).' },
      { status: 400 },
    )
  }
}
