type TraceListener = (trace: ParsedTrace) => void
type StatsListener = (stats: AggregateStats) => void

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

export interface AggregateStats {
  totalCommits: number
  totalLinesAdded: number
  aiLines: number
  humanLines: number
  mixedLines: number
  byAuthor: Record<string, { commits: number; aiLines: number; humanLines: number; mixedLines: number }>
  byRepo: Record<string, { commits: number; aiLines: number; humanLines: number; mixedLines: number }>
}

class TraceStore {
  private traces: ParsedTrace[] = []
  private listeners: Set<TraceListener> = new Set()
  private statsListeners: Set<StatsListener> = new Set()
  private stats: AggregateStats = {
    totalCommits: 0,
    totalLinesAdded: 0,
    aiLines: 0,
    humanLines: 0,
    mixedLines: 0,
    byAuthor: {},
    byRepo: {},
  }

  addTrace(trace: ParsedTrace) {
    this.traces.unshift(trace)
    if (this.traces.length > 100) {
      this.traces = this.traces.slice(0, 100)
    }
    
    // Update aggregate stats
    this.updateStats(trace)
    
    this.listeners.forEach(listener => listener(trace))
    this.statsListeners.forEach(listener => listener(this.stats))
  }

  private updateStats(trace: ParsedTrace) {
    let aiLines = 0, humanLines = 0, mixedLines = 0, totalLines = 0
    
    try {
      const stats = JSON.parse(trace.aiStats.replace(/\\"/g, '"'))
      aiLines = stats.ai_additions || 0
      humanLines = stats.human_additions || 0
      mixedLines = stats.mixed_additions || 0
      totalLines = aiLines + humanLines + mixedLines
    } catch {
      // Stats parsing failed, skip
    }

    this.stats.totalCommits++
    this.stats.totalLinesAdded += totalLines
    this.stats.aiLines += aiLines
    this.stats.humanLines += humanLines
    this.stats.mixedLines += mixedLines

    // By author
    if (!this.stats.byAuthor[trace.author]) {
      this.stats.byAuthor[trace.author] = { commits: 0, aiLines: 0, humanLines: 0, mixedLines: 0 }
    }
    this.stats.byAuthor[trace.author].commits++
    this.stats.byAuthor[trace.author].aiLines += aiLines
    this.stats.byAuthor[trace.author].humanLines += humanLines
    this.stats.byAuthor[trace.author].mixedLines += mixedLines

    // By repo
    if (!this.stats.byRepo[trace.repo]) {
      this.stats.byRepo[trace.repo] = { commits: 0, aiLines: 0, humanLines: 0, mixedLines: 0 }
    }
    this.stats.byRepo[trace.repo].commits++
    this.stats.byRepo[trace.repo].aiLines += aiLines
    this.stats.byRepo[trace.repo].humanLines += humanLines
    this.stats.byRepo[trace.repo].mixedLines += mixedLines
  }

  getTraces(): ParsedTrace[] {
    return [...this.traces]
  }

  getStats(): AggregateStats {
    return { ...this.stats }
  }

  subscribe(listener: TraceListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  subscribeStats(listener: StatsListener): () => void {
    this.statsListeners.add(listener)
    return () => this.statsListeners.delete(listener)
  }
}

export const traceStore = new TraceStore()
