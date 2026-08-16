"use client"

import React from "react"
import { useLanguage } from "@/context/language-context"

export function Footer() {
    const { t } = useLanguage()

    return (
        <footer
            className="px-6 py-16 md:py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 rounded-t-[3rem]"
            role="contentinfo"
            suppressHydrationWarning
        >
            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded-lg text-white">
                            <span className="material-symbols-outlined block text-2xl">cloud_done</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">CloudMaster</h2>
                    </div>
                    <p className="text-slate-500 max-w-sm leading-relaxed">
                        {t('footer.description')}
                    </p>
                    <div className="pt-4">
                        <form className="flex gap-2 max-w-sm">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                {t('footer.subscribe')}
                            </button>
                        </form>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold mb-6 text-slate-900 dark:text-white uppercase text-xs tracking-wider">{t('footer.program')}</h4>
                    <ul className="space-y-4 text-sm text-slate-500 font-medium">
                        <li><a className="hover:text-primary transition-colors" href="#">{t('footer.full_catalog')}</a></li>
                        <li><a className="hover:text-primary transition-colors" href="#">{t('footer.certifications')}</a></li>
                        <li><a className="hover:text-primary transition-colors" href="#">{t('footer.enterprise')}</a></li>
                        <li><a className="hover:text-primary transition-colors" href="#">{t('footer.mentorship')}</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-6 text-slate-900 dark:text-white uppercase text-xs tracking-wider">{t('footer.support')}</h4>
                    <ul className="space-y-4 text-sm text-slate-500 font-medium">
                        <li><a className="hover:text-primary transition-colors" href="#">{t('footer.help_center')}</a></li>
                        <li><a className="hover:text-primary transition-colors" href="#">{t('footer.terms')}</a></li>
                        <li><a className="hover:text-primary transition-colors" href="#">{t('footer.privacy')}</a></li>
                        <li><a className="hover:text-primary transition-colors" href="#">{t('footer.contact')}</a></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4 text-xs text-slate-500 font-medium">
                <p>&copy; 2026 {t('footer.rights')}</p>
                <div className="flex gap-6">
                    <a className="hover:text-[#0d141b] dark:hover:text-white" href="#">{t('footer.privacy')}</a>
                    <a className="hover:text-[#0d141b] dark:hover:text-white" href="#">{t('footer.terms')}</a>
                    <a className="hover:text-[#0d141b] dark:hover:text-white" href="#">Twitter</a>
                    <a className="hover:text-[#0d141b] dark:hover:text-white" href="#">LinkedIn</a>
                </div>
            </div>
        </footer>
    );
}
