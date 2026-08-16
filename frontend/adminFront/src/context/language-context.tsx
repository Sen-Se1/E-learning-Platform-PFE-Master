"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { translations, Language } from "../lib/translations"

type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
    dir: "ltr" | "rtl"
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en")

    // Optional: Load from local storage
    useEffect(() => {
        const savedLang = localStorage.getItem("language") as Language
        if (savedLang && translations[savedLang]) {
            setLanguage(savedLang)
        }
    }, [])

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang)
        localStorage.setItem("language", lang)
        document.documentElement.dir = "ltr"
        document.documentElement.lang = lang
    }

    const t = (path: string) => {
        const keys = path.split('.')
        let current: Record<string, unknown> | string = translations[language] as unknown as Record<string, unknown>

        for (const key of keys) {
            if (typeof current === 'object' && current !== null && key in (current as Record<string, unknown>)) {
                current = (current as Record<string, unknown>)[key] as Record<string, unknown> | string
            } else {
                console.warn(`Translation key not found: ${path}`)
                return path // Fallback to key
            }
        }

        return current as string
    }

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage: handleSetLanguage,
            t,
            dir: "ltr"
        }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
