import { traceStore } from '@/lib/traceStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  const traces = traceStore.getTraces()
  const stats = traceStore.getStats()
  
  return Response.json({ traces, stats }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  })
}
