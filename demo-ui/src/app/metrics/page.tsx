'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AggregateStats } from '@/lib/traceStore'

export default function MetricsPage() {
  const [stats, setStats] = useState<AggregateStats>({
    totalCommits: 0,
    totalLinesAdded: 0,
    aiLines: 0,
    humanLines: 0,
    mixedLines: 0,
    byAuthor: {},
    byRepo: {},
  })
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const eventSource = new EventSource('/api/stats')
    
    eventSource.onopen = () => setConnected(true)
    eventSource.onerror = () => setConnected(false)
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as AggregateStats
      setStats(data)
    }

    return () => eventSource.close()
  }, [])

  const totalLines = stats.aiLines + stats.humanLines + stats.mixedLines
  const aiPercent = totalLines > 0 ? (stats.aiLines / totalLines * 100).toFixed(1) : '0'
  const humanPercent = totalLines > 0 ? (stats.humanLines / totalLines * 100).toFixed(1) : '0'
  const mixedPercent = totalLines > 0 ? (stats.mixedLines / totalLines * 100).toFixed(1) : '0'

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Aggregate Metrics</h1>
            <p className="text-gray-400 mt-1">Lines of code attribution across all commits</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
              ← Back to Traces
            </Link>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-400">{connected ? 'Live' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <p className="text-gray-500 text-sm">Total Commits</p>
          <p className="text-3xl font-bold text-white">{stats.totalCommits}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <p className="text-gray-500 text-sm">Total Lines</p>
          <p className="text-3xl font-bold text-white">{totalLines.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <p className="text-gray-500 text-sm">Authors</p>
          <p className="text-3xl font-bold text-white">{Object.keys(stats.byAuthor).length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <p className="text-gray-500 text-sm">Repositories</p>
          <p className="text-3xl font-bold text-white">{Object.keys(stats.byRepo).length}</p>
        </div>
      </div>

      {/* LOC Breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Lines of Code by Attribution</h2>
        
        {totalLines === 0 ? (
          <p className="text-gray-500 text-center py-8">No data yet — make some commits!</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400">{stats.aiLines.toLocaleString()}</div>
                <div className="text-sm text-gray-400 mt-1">AI Lines</div>
                <div className="text-lg text-purple-400">{aiPercent}%</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">{stats.humanLines.toLocaleString()}</div>
                <div className="text-sm text-gray-400 mt-1">Human Lines</div>
                <div className="text-lg text-blue-400">{humanPercent}%</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-400">{stats.mixedLines.toLocaleString()}</div>
                <div className="text-sm text-gray-400 mt-1">Mixed Lines</div>
                <div className="text-lg text-amber-400">{mixedPercent}%</div>
              </div>
            </div>

            {/* Stacked Bar */}
            <div className="w-full h-8 rounded-full overflow-hidden flex bg-gray-800">
              <div
                className="bg-purple-500 transition-all"
                style={{ width: `${aiPercent}%` }}
                title={`AI: ${aiPercent}%`}
              />
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${humanPercent}%` }}
                title={`Human: ${humanPercent}%`}
              />
              <div
                className="bg-amber-500 transition-all"
                style={{ width: `${mixedPercent}%` }}
                title={`Mixed: ${mixedPercent}%`}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-500 rounded" /> AI</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded" /> Human</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded" /> Mixed</span>
            </div>
          </>
        )}
      </div>

      {/* By Author */}
      {Object.keys(stats.byAuthor).length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">By Author</h2>
          <div className="space-y-4">
            {Object.entries(stats.byAuthor).map(([author, data]) => {
              const authorTotal = data.aiLines + data.humanLines + data.mixedLines
              const authorAiPct = authorTotal > 0 ? (data.aiLines / authorTotal * 100) : 0
              const authorHumanPct = authorTotal > 0 ? (data.humanLines / authorTotal * 100) : 0
              const authorMixedPct = authorTotal > 0 ? (data.mixedLines / authorTotal * 100) : 0
              
              return (
                <div key={author} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-200">{author}</span>
                    <span className="text-sm text-gray-400">{data.commits} commits</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-700">
                    <div className="bg-purple-500" style={{ width: `${authorAiPct}%` }} />
                    <div className="bg-blue-500" style={{ width: `${authorHumanPct}%` }} />
                    <div className="bg-amber-500" style={{ width: `${authorMixedPct}%` }} />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>AI: {data.aiLines}</span>
                    <span>Human: {data.humanLines}</span>
                    <span>Mixed: {data.mixedLines}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* By Repo */}
      {Object.keys(stats.byRepo).length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">By Repository</h2>
          <div className="space-y-4">
            {Object.entries(stats.byRepo).map(([repo, data]) => {
              const repoTotal = data.aiLines + data.humanLines + data.mixedLines
              const repoAiPct = repoTotal > 0 ? (data.aiLines / repoTotal * 100) : 0
              const repoHumanPct = repoTotal > 0 ? (data.humanLines / repoTotal * 100) : 0
              const repoMixedPct = repoTotal > 0 ? (data.mixedLines / repoTotal * 100) : 0
              
              return (
                <div key={repo} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-200">{repo}</span>
                    <span className="text-sm text-gray-400">{data.commits} commits</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-700">
                    <div className="bg-purple-500" style={{ width: `${repoAiPct}%` }} />
                    <div className="bg-blue-500" style={{ width: `${repoHumanPct}%` }} />
                    <div className="bg-amber-500" style={{ width: `${repoMixedPct}%` }} />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>AI: {data.aiLines}</span>
                    <span>Human: {data.humanLines}</span>
                    <span>Mixed: {data.mixedLines}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </main>
  )
}
