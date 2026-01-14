import { NextRequest, NextResponse } from 'next/server'
import { traceStore, ParsedTrace } from '@/lib/traceStore'

interface OTLPAttribute {
  key: string
  value: { stringValue?: string; intValue?: string }
}

interface OTLPSpan {
  traceId: string
  spanId: string
  name: string
  attributes?: OTLPAttribute[]
}

interface OTLPPayload {
  resourceSpans?: Array<{
    resource?: { attributes?: OTLPAttribute[] }
    scopeSpans?: Array<{
      spans?: OTLPSpan[]
    }>
  }>
}

function getAttribute(attrs: OTLPAttribute[] | undefined, key: string): string {
  const attr = attrs?.find(a => a.key === key)
  return attr?.value?.stringValue || attr?.value?.intValue || ''
}

export async function POST(request: NextRequest) {
  try {
    const payload: OTLPPayload = await request.json()
    
    for (const resourceSpan of payload.resourceSpans || []) {
      const resourceAttrs = resourceSpan.resource?.attributes
      const repo = getAttribute(resourceAttrs, 'vcs.repository.name')
      
      for (const scopeSpan of resourceSpan.scopeSpans || []) {
        for (const span of scopeSpan.spans || []) {
          const attrs = span.attributes
          
          const trace: ParsedTrace = {
            id: `${span.traceId}-${span.spanId}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            traceId: span.traceId,
            spanId: span.spanId,
            commitId: getAttribute(attrs, 'vcs.commit.id'),
            commitShort: getAttribute(attrs, 'vcs.commit.id.short'),
            message: getAttribute(attrs, 'vcs.commit.message'),
            author: getAttribute(attrs, 'vcs.commit.author.name'),
            email: getAttribute(attrs, 'vcs.commit.author.email'),
            branch: getAttribute(attrs, 'vcs.branch'),
            repo,
            aiStats: getAttribute(attrs, 'git.ai.stats'),
          }
          
          traceStore.addTrace(trace)
        }
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Error processing OTLP payload:', error)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
