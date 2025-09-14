import { supabase } from '@/lib/supabase'
import { profileService } from './database'

export const authService = {
  // Sign up new user
  async signUp({ email, password, name, role = 'viewer' }) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      })

      if (authError) throw authError

      // Create profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            name,
            role
          })

        if (profileError) throw profileError
      }

      return { user: authData.user, session: authData.session }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  },

  // Sign in user
  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return { user: data.user, session: data.session }
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return true
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) return null

    // Get full profile
    try {
      const profile = await profileService.getProfile(user.id)
      return {
        ...user,
        profile
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      return user
    }
  },

  // Get session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Update password
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
    return true
  },

  // Reset password request
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw error
    return true
  },

  // Update user profile
  async updateProfile(updates) {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) throw new Error('User not authenticated')

    // Update auth metadata
    if (updates.name) {
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: updates.name }
      })
      
      if (authError) throw authError
    }

    // Update profile table
    const profile = await profileService.updateProfile(user.id, updates)
    
    return profile
  },

  // Check if user has role
  async hasRole(requiredRoles) {
    const user = await this.getCurrentUser()
    
    if (!user || !user.profile) return false
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.profile.role)
    }
    
    return user.profile.role === requiredRoles
  },

  // Subscribe to auth changes
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        let user = null
        
        if (session?.user) {
          try {
            const profile = await profileService.getProfile(session.user.id)
            user = {
              ...session.user,
              profile
            }
          } catch (error) {
            console.error('Error fetching profile in auth state change:', error)
            user = session.user
          }
        }
        
        callback(event, session, user)
      }
    )

    return subscription
  },

  // Upload avatar
  async uploadAvatar(userId, file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update profile
    await profileService.updateProfile(userId, {
      avatar_url: publicUrl
    })

    return publicUrl
  }
}