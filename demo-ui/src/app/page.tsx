'use client'

import { useEffect, useState } from 'react'

interface CommitTrace {
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

export default function Home() {
  const [traces, setTraces] = useState<CommitTrace[]>([])
  const [connected, setConnected] = useState(false)
  const [stats, setStats] = useState({ aiLines: 0, humanLines: 0, mixedLines: 0 })

  useEffect(() => {
    const fetchTraces = async () => {
      try {
        const response = await fetch('/api/events')
        const data = await response.json()
        setTraces(data.traces || [])
        if (data.stats) {
          setStats({
            aiLines: data.stats.aiLines || 0,
            humanLines: data.stats.humanLines || 0,
            mixedLines: data.stats.mixedLines || 0,
          })
        }
        setConnected(true)
      } catch {
        setConnected(false)
      }
    }

    fetchTraces()
    const intervalId = setInterval(fetchTraces, 2000)

    return () => clearInterval(intervalId)
  }, [])

  const parseAiStats = (stats: string) => {
    try {
      return JSON.parse(stats.replace(/\\"/g, '"'))
    } catch {
      return null
    }
  }

  const totals = stats

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Attribution Tracker</h1>
            <p className="text-gray-400 mt-1">Real-time AI code attribution tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-500 text-sm">Lines written by AI</p>
          <p className="text-2xl font-bold text-purple-400">{totals.aiLines.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-500 text-sm">Lines written by human</p>
          <p className="text-2xl font-bold text-blue-400">{totals.humanLines.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-500 text-sm">Lines written by both</p>
          <p className="text-2xl font-bold text-amber-400">{totals.mixedLines.toLocaleString()}</p>
        </div>
      </div>

      {traces.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-6xl mb-4">📡</div>
          <p className="text-lg">Waiting for traces...</p>
          <p className="text-sm mt-2">POST OTLP traces to <code className="bg-gray-800 px-2 py-1 rounded">/api/v1/traces</code></p>
        </div>
      ) : (
        <div className="space-y-4">
          {traces.map((trace) => {
            const stats = parseAiStats(trace.aiStats)
            return (
              <div
                key={trace.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <code className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-mono">
                      {trace.commitShort}
                    </code>
                    <span className="text-gray-300 font-medium">{trace.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">{trace.timestamp}</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Author</span>
                    <p className="text-gray-300">{trace.author}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Branch</span>
                    <p className="text-gray-300">{trace.branch}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Repository</span>
                    <p className="text-gray-300">{trace.repo}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Trace ID</span>
                    <p className="text-gray-300 font-mono text-xs truncate">{trace.traceId}</p>
                  </div>
                </div>

                {stats && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-300">AI Attribution</span>
                      {stats.ai_percentage !== undefined && (
                        <span className="text-sm font-bold text-purple-400">
                          {stats.ai_percentage}% AI code
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.ai_percentage || 0}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-purple-400 font-semibold text-lg">{stats.ai_additions ?? 0}</p>
                        <p className="text-gray-500 text-xs">AI Lines</p>
                      </div>
                      <div className="text-center">
                        <p className="text-blue-400 font-semibold text-lg">{stats.human_additions ?? 0}</p>
                        <p className="text-gray-500 text-xs">Human Lines</p>
                      </div>
                      <div className="text-center">
                        <p className="text-amber-400 font-semibold text-lg">{stats.mixed_additions ?? 0}</p>
                        <p className="text-gray-500 text-xs">Mixed Lines</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
