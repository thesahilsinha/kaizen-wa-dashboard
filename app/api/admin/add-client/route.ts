import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_MASTER_SUPABASE_URL!,
    process.env.MASTER_SUPABASE_SERVICE_KEY!
  )

  // Create auth user for client
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: body.login_email,
    password: 'Kaizen@2024',
    email_confirm: true
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // Insert into master_clients
  const { error } = await supabase.from('master_clients').insert({
    business_name: body.business_name,
    login_email: body.login_email,
    supabase_url: body.supabase_url,
    supabase_anon_key: body.supabase_anon_key,
    supabase_service_key: body.supabase_service_key,
    domain: body.domain || null,
    setup_fee: parseFloat(body.setup_fee) || 0,
    monthly_retainer: parseFloat(body.monthly_retainer) || 0,
    billing_day: parseInt(body.billing_day) || 1,
    next_renewal: body.next_renewal || null,
    payment_status: body.payment_status,
    notes: body.notes || null,
    is_active: true
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}