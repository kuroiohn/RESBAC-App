import { createContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const UserContext = createContext()

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [authChecked, setAuthChecked] = useState(false)

    async function login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            
            if (error) throw error
            
            setUser(data.user)
            return data
        } catch (error) {
            throw Error(error.message)
        }
    }

    async function register(email, password) {
        try {
            console.log('Attempting registration with:', email)
            
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            })

            console.log('Supabase response:', data)
            console.log('Supabase error:', error)
            
            if (error) throw error
            
            setUser(data.user)
            return data
        } catch (error) {
            console.error('Registration error:', error)
            throw Error(error.message)
        }
    }

    async function logout() {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            setUser(null)
        } catch (error) {
            throw Error(error.message)
        }
    }

    async function getInitialUserValue() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
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
