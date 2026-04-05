import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getApiKey } from '@/lib/api'
import CliCallback from './cli-callback'

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: { source?: string }
}) {
  const token = cookies().get('fm_token')?.value
  if (!token) redirect('/login')

  let apiKey = ''
  try {
    const result = await getApiKey(token)
    apiKey = result.api_key
  } catch {
    redirect('/billing')
  }

  return <CliCallback apiKey={apiKey} source={searchParams.source} />
}
