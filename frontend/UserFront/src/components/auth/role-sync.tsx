"use client"

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUserStore } from '@/lib/store'
import { toast } from 'sonner'

export function RoleSync() {
    const { user, setUser } = useUserStore()
    const router = useRouter()
    const pathname = usePathname()
    const lastCheck = useRef<number>(0)

    useEffect(() => {
        // Ne rien faire si l'utilisateur n'est pas connecté ou si on est sur une page d'auth
        if (!user || pathname.startsWith('/auth')) return

        const syncRole = async () => {
            const now = Date.now()
            // Éviter de surcharger le serveur (vérification max toutes les 30 secondes)
            if (now - lastCheck.current < 30000) return
            lastCheck.current = now

            const token = localStorage.getItem('user-token')
            if (!token) return

            const apiUrl = process.env.NEXT_PUBLIC_USER_API_URL
            if (!apiUrl) {
                console.warn("RoleSync: NEXT_PUBLIC_USER_API_URL is not defined.")
                return
            }

            try {
                console.log(`RoleSync: Checking role at ${apiUrl}/auth/me...`)
                const response = await fetch(`${apiUrl}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    const result = await response.json()
                    const latestUser = result.data

                    // 1. Vérifier si le compte est toujours actif
                    if (latestUser.isActive === false) {
                        localStorage.removeItem('user-token')
                        document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                        const { logout } = useUserStore.getState()
                        logout()
                        toast.error("Votre compte a été désactivé par un administrateur.")
                        router.push('/auth')
                        return
                    }

                    // 2. Vérifier si le rôle a changé !
                    if (latestUser.role !== user.role) {
                        // 1. Mettre à jour le cookie pour le middleware
                        document.cookie = `user-role=${latestUser.role}; path=/; max-age=86400`

                        // 2. Mettre à jour le store Zustand
                        setUser({
                            id: latestUser._id,
                            name: `${latestUser.profile?.firstName || ''} ${latestUser.profile?.lastName || ''}`.trim() || latestUser.email.split('@')[0],
                            email: latestUser.email,
                            role: latestUser.role,
                            avatar: latestUser.profile?.avatar
                        })

                        // 3. Notifier l'utilisateur
                        toast.success(`Votre rôle a été mis à jour : ${latestUser.role}`, {
                            description: "Mise à jour de l'interface..."
                        })

                        // 4. Rediriger vers le bon dashboard et forcer un rafraîchissement si nécessaire
                        const newPath = latestUser.role === 'instructor'
                            ? '/instructor/dashboard'
                            : '/student/dashboard'

                        setTimeout(() => {
                            window.location.href = newPath
                        }, 1500)
                    }
                }
            } catch (error) {
                // Prevent Next.js error overlay from popping up by using console.warn instead of console.error
                console.warn("RoleSync: Could not connect to API to check role.", error instanceof Error ? error.message : "Unknown error")
            }
        }

        // Vérifier au montage et lors des changements de page
        syncRole()

        // Optionnel : petite vérification périodique toutes les 2 minutes
        const interval = setInterval(syncRole, 120000)
        return () => clearInterval(interval)
    }, [user, pathname, setUser, router])

    return null
}
