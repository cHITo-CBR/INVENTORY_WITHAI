import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error, data: { user } } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // 1. Check if user profile exists in public.users
      const { data: profile } = await supabase
        .from('users')
        .select('*, roles(name)')
        .eq('id', user.id)
        .single()

      if (!profile) {
        // New Google user -> Create pending buyer profile
        const { data: roleData } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'buyer')
          .single()
        
        if (roleData) {
          await supabase.from('users').insert([{
            id: user.id,
            full_name: user.user_metadata.full_name || 'Google User',
            email: user.email,
            role_id: roleData.id,
            status: 'pending',
            is_active: false
          }])
          
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/signup?success=google_pending`)
        }
      }

      // 2. Check profile status
      if (profile?.status === 'pending') {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=Account%20is%20pending%20approval`)
      }
      
      if (profile?.status === 'rejected') {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=Account%20rejected`)
      }

      if (profile?.is_active === false) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=Account%20is%20inactive`)
      }

      // 3. Update metadata to ensure role is available in middleware
      const roleName = profile?.roles?.name
      if (roleName) {
        await supabase.auth.updateUser({
          data: { role: roleName }
        })
      }

      const roleDashboardMap: Record<string, string> = {
        admin: "/admin/dashboard",
        salesman: "/salesman/dashboard",
        supervisor: "/supervisor/dashboard",
        buyer: "/customers/catalog/products",
      };

      const redirectUrl = roleName ? (roleDashboardMap[roleName] || next) : next
      return NextResponse.redirect(`${origin}${redirectUrl}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Authentication%20failed`)
}
