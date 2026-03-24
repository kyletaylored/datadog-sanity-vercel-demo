import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId} from '@/sanity/lib/api'

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export async function POST(request: Request) {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return Response.json({error: 'Write token not configured'}, {status: 503})
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({error: 'Invalid JSON'}, {status: 400})
  }

  const {name, email, company, interestedIn, message, source} = body as {
    name?: string
    email?: string
    company?: string
    interestedIn?: string
    message?: string
    source?: string
  }

  if (!name || !email) {
    return Response.json({error: 'Name and email are required'}, {status: 400})
  }

  try {
    await writeClient.create({
      _type: 'lead',
      name,
      email,
      ...(company ? {company} : {}),
      ...(interestedIn ? {interestedIn} : {}),
      ...(message ? {message} : {}),
      submittedAt: new Date().toISOString(),
      source: source || 'unknown',
    })

    return Response.json({success: true})
  } catch (err) {
    console.error('Failed to create lead in Sanity:', err)
    return Response.json({error: 'Failed to save submission'}, {status: 500})
  }
}
