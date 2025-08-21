import { createContext, useEffect, useState } from 'react'
import supabase from './supabaseClient'

export const UserContext = createContext()

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [authChecked, setAuthChecked] = useState(false)

    async function login(email, password) {
        try {
            console.log('Login attempt for:', email)
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            
            if (error) throw error
            
            console.log('Login successful:', data.user.id)
            setUser(data.user)
            return data
        } catch (error) {
            console.error('Login error:', error)
            throw Error(error.message)
        }
    }

    async function register(email, password, extraData = {}) {
        try {
            console.log('Attempting registration with:', email)

            // Make sure any previous session is cleared
            await supabase.auth.signOut()
            
            // Create new auth account
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            })

            if (error) throw error

            console.log('Auth account created successfully:', data.user.id)
            
            setUser(data.user)
            return data
        } catch (error) {
            console.error('Registration error:', error)
            throw Error(error.message)
        }
    }

    async function logout() {
        try {
            console.log('Logging out user')
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            setUser(null)
            console.log('Logout successful')
        } catch (error) {
            console.error('Logout error:', error)
            throw Error(error.message)
        }
    }

    async function getInitialUserValue() {
        try {
            console.log('Getting initial user value...')
            const { data: { user }, error } = await supabase.auth.getUser()
            
            if (error) {
                console.error('Error getting initial user:', error)
                setUser(null)
            } else {
                console.log('Initial user found:', user?.id || 'none')
                setUser(user)
            }
        } catch (error) {
            console.error('Error getting user:', error)
            setUser(null)
        } finally {
            setAuthChecked(true)
        }
    }

    useEffect(() => {
        getInitialUserValue()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('=== AUTH STATE CHANGE ===')
                console.log('Event:', event)
                console.log('Session exists:', !!session)
                console.log('User ID:', session?.user?.id)
                console.log('Session expires at:', session?.expires_at)
                console.log('========================')
                setUser(session?.user ?? null)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    return (
        <UserContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout,
            authChecked
        }}>
            {children}
        </UserContext.Provider>
    )
}
