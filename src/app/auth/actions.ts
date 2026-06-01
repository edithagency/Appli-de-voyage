'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: 'Email ou mot de passe incorrect.' }
  }

  revalidatePath('/', 'layout')

  // Redirige vers onboarding si pas encore complété
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('profil_voyageur')
      .eq('id', user.id)
      .single()
    if (!profile?.profil_voyageur) {
      redirect('/onboarding')
    }
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
  }

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
      data: {
        prenom: formData.get('prenom') as string,
        nom: formData.get('nom') as string,
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Un compte existe déjà avec cet email.' }
    }
    return { error: 'Une erreur est survenue. Réessaie.' }
  }

  redirect('/auth/confirm-email?sent=1')
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get('email') as string,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/reset-password`,
    }
  )

  if (error) {
    return { error: 'Une erreur est survenue. Réessaie.' }
  }

  return { success: true }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
