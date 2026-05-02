// API route for transaction history
// This would connect to Upstash Redis KV for production

export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  const url = new URL(request.url)
  const address = url.searchParams.get('address')

  if (!address) {
    return new Response(JSON.stringify({ error: 'Address required' }), { status: 400 })
  }

  try {
    // In production, fetch from Upstash KV or database
    // For now, return empty array
    const transactions = []

    return new Response(JSON.stringify({ transactions }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[API] Error:', error)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
}
