type TraceListener = (trace: ParsedTrace) => void

export interface ParsedTrace {
  id: string
  timestamp: string
  traceId: string
  spanId: string
  commitId: string
  commitShort: string
  message: string
  author: string
  email: string
  branch: string
  repo: string
  aiStats: string
}

class TraceStore {
  private traces: ParsedTrace[] = []
  private listeners: Set<TraceListener> = new Set()

  addTrace(trace: ParsedTrace) {
    this.traces.unshift(trace)
    if (this.traces.length > 100) {
      this.traces = this.traces.slice(0, 100)
    }
    this.listeners.forEach(listener => listener(trace))
  }

  getTraces(): ParsedTrace[] {
    return [...this.traces]
  }

  subscribe(listener: TraceListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

export const traceStore = new TraceStore()
