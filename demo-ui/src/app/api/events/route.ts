import { traceStore } from '@/lib/traceStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Send existing traces
      for (const trace of traceStore.getTraces()) {
        sendEvent(trace)
      }

      // Subscribe to new traces
      const unsubscribe = traceStore.subscribe((trace) => {
        sendEvent(trace)
      })

      // Keep connection alive
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keepalive\n\n'))
      }, 30000)

      // Cleanup on close
      const cleanup = () => {
        unsubscribe()
        clearInterval(keepAlive)
      }

      // Handle client disconnect
      return cleanup
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
