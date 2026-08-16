"use client"

import { Navbar } from '@/components/layout/navbar';
import React from 'react';

import { useLanguage } from '@/context/language-context';
import { Footer } from '@/components/layout/footer';

// Types pour les données de l'équipe
interface TeamMember {
    id: string;
    name: string;
    title: string;
    role: string;
    bio: string;
    image: string;
}

// Types pour les partenariats
interface Partnership {
    id: string;
    name: string;
    logo: string;
    url?: string;
}

// Types pour les certifications
interface Certification {
    id: string;
    label: string;
    icon: string;
}

const AboutPage: React.FC = () => {
    const { t, dir } = useLanguage();

    // Données de l'équipe
    const teamMembers: TeamMember[] = [
        {
            id: 'helena-vance',
            name: t('about.team.helena.name'),
            title: t('about.team.helena.title'),
            role: t('about.team.helena.role'),
            bio: t('about.team.helena.bio'),
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCORTHTME_zGUuVgLXB_dDPPltXsrFQ1yUa5IFGaL2hrAg8xHZWW5yzlIQPYLaLmQb_k2xgD2UxoMWdD0zgk2l3t_sGXtzCyYz-ZaufeYrB0u53S2ESS6vM9EnW_74BwWDYAtLMoLkMe3x4msZdgBCKo-nFMoS7F10mJ704jeF7HZCwmQ9d39R756oECbJPDNa6x3mMGQ_o2hQWCuREhrYdfuo2Ykr3kH2cDyLp6qbFIJE3S3D6oTBrocJdKvkWtBTUWu4uoJad20SC',
        },
        {
            id: 'marcus-thorne',
            name: t('about.team.marcus.name'),
            title: t('about.team.marcus.title'),
            role: t('about.team.marcus.role'),
            bio: t('about.team.marcus.bio'),
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaeCyS0PphvU5m7sghYSYN8_LrUsNCGU4lEokyZkPyLVu5JqIneIvFBT-y7EoYJYvj6oGCuj8mOD9lJ0Por-6MRXyyf2Z431uAc46Y8SQScI-KztC3EvWSiPt__hde6jNp5x7Tj5pVpo4Dk6Qq-GN5q3lDrnqQ3Q9dVVUmJg8JQHqw0fHkGrqur19Fhcxv_83HsRQm-ibKBmlRzygTV8NPyCJnrvchpMVGso7huXmbRZCPjgARigGKvOYhGtNgdwfppzk2-7QNIgZ1',
        },
        {
            id: 'sarah-jenkins',
            name: t('about.team.sarah.name'),
            title: t('about.team.sarah.title'),
            role: t('about.team.sarah.role'),
            bio: t('about.team.sarah.bio'),
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQ6NhGg8aTmka3VQgDY1uoUd2kPS0gLbpYdKNsDnjwkuWxU0_Sfx6wDIcey5F3idQIiY_zMu_9UxzE0VlO3ij2CJv2RozfiELz7jYM0mtdhD6aeNZt8c16c3Iv_UHWaDkZ4pKESwF3F3C7XJ7CjTYip4t6vI5MfXOy1uLU4lobbIati9j_WpJzOwPrHrLY8NwIHau6ZFqsSmP6sOOj-WY_4cx5rYUPfjRnN53sBlXeIDKgsyrCacl1nWp1-SKdAF3yUjjBL8IP5YHs',
        },
    ];

    // Données des partenariats
    const partnerships: Partnership[] = [
        {
            id: 'stanford',
            name: 'Stanford University',
            logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1XzRp0Kt7w-qzO7a0IqQOseq1tNyLZOu2idpFQKVg173dVT255EyIHXWVUFkJtG442dqQJNRa7BKhpiHFDgiVVov-IpPLN1TO6It0v-c5APfD2vAPxHxapfS7z_w3rYt8HVucZ4FIgpmwvVcdP-hN5eZAzA4FCV5HpCtiT73GuPYVVSZm58LiuEUFsuaQC2J7lq6GGUf2u6ZH4dxsrPwOQFuLyq87t75GGdWV-cFnliP3o-8MC-S_yjnI6UEKcPX2epx6foCbDa1D',
        },
        {
            id: 'mit',
            name: 'MIT',
            logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBUzFoJqctX1l-zpJh10pc1mssCRkg95ZVFaeImP4U8VJxNPvYZiEk2C4DDsJkoqf19kAUEzoBFC4mhFjQk7T2F08Aa-dBHTTtJkLfsli2yLZIgnuQkXGMRfaJO3eG6faCkucuzxStleqHRWg1IH53rlCQzqsI9dQF9ccZsmmR24ADFDvxo3XbCnt6LM8VDzEk1mm0lK76aJrnw30kwEERMvBJz7BTfJ6RQiCSDWufMnd1rElXvVXF_mwLS8b_h2GQj84lxHyz0qmJ',
        },
        {
            id: 'aws',
            name: 'Amazon Web Services',
            logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXRC3jfezRLxRCapPwsXW_as4s3OFBZkyOt_w6Ru_G5l65AlDbqfPrrqAEw5CbSeZHRguiBvFJcPo-ATrzdOWIkSO86_qO2XpyHk7JRsDhmg_Lk8-xInGz_I-XviyQDbyJOgs7zKEQnonagTgEU4QKxGI_l22ZeWnqkl5ivMKjuj0-6-m5wyuhGleGqUoRqiWWX1Xsjb9TfM7gpaVm0tay5JVDb7g2yqkydN3EJvt4-NzNP8NfRHRgZNPWVhYqIlXF7Mj1MXzVm4S5',
        },
        {
            id: 'google-cloud',
            name: 'Google Cloud Platform',
            logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrvsVBPI5wawYJ1gdIvEgIn9aQfNb6ICwudSnjYVW4xA9hNANWwEZadPOLkkYfq2bgGUszGhI3-CdGuguus0REII3MWS7oU3DgTg1ACxi5l2j78VaS2LK7iHN-HsGaMQMbLRaoJlyAsDosGS9x-AP0i8O-N_CIMFlGJ5AOVJgdyH66LJdbiqW1A8Xdj4VNTiUyNWJXJ4rRuHnWZgx1RDvjlyY7G8d-_nw_lV9xTfsVl-E_PvCowb5nziLwhRw3sEO-xQXGXS91Oky-',
        },
    ];

    // Données des certifications
    const certifications: Certification[] = [
        {
            id: 'iso',
            label: t('about.iso'),
            icon: 'verified',
        },
        {
            id: 'curriculum',
            label: t('about.curriculum'),
            icon: 'verified',
        },
        {
            id: 'credits',
            label: t('about.credits'),
            icon: 'verified',
        },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#0d141b] dark:text-slate-50 transition-colors duration-300 font-display" dir={dir}>
            {/* Header */}
            <Navbar />

            <main className="max-w-[1200px] mx-auto overflow-x-hidden">
                {/* Hero Section */}
                <section className="px-6 py-16 md:py-24 text-center" aria-labelledby="about-hero-title">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider"
                            aria-label="Section indicator"
                        >
                            {t('about.hero_tag')}
                        </div>
                        <h1
                            id="about-hero-title"
                            className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-[#0d141b] dark:text-white"
                        >
                            {t('about.hero_title')} <span className="text-primary">{t('about.hero_title_highlight')}</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t('about.hero_desc')}
                        </p>
                    </div>
                </section>

                {/* Vision Section */}
                <section
                    className="px-6 py-16 md:py-20 border-t border-slate-200 dark:border-slate-800"
                    aria-labelledby="vision-section-title"
                >
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div
                                className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl bg-cover bg-center"
                                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBdA9D-vpZL0rhwOypgRPpXm5ucPiOuVSDOoRvn-peamRAWHZGXpPQn77h4FDJxcLzbw-SMHReLNH9rk4pZAFUauxrtQ8UfLg_zhJ6eIWJzbWKuDvP8FcFt6mqXaprqzcnEcL8DaWsUu0vTGWp54i-Ab7iuZt6ogmHOnzAbQPkaiN8MtzdvztTlqRGcWjozBhGHgWwd__0NM6S1QfWv6_Yiv1nXn0NTxsW1NvaZfgCxe2-GbY7c07zO0pfncTKAMIXQkD8qe_9Pymem')` }}
                                role="img"
                                aria-label="Cloud infrastructure visualization"
                            ></div>
                            <div
                                className={`absolute -bottom-6 ${dir === 'rtl' ? '-left-6' : '-right-6'} bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 max-w-[240px]`}
                                aria-label="Founders quote"
                            >
                                <p className="text-sm font-bold text-primary mb-2 italic">
                                    {t('about.quote')}
                                </p>
                                <p className="text-xs text-slate-500 font-medium">{t('about.quote_author')}</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h2
                                id="vision-section-title"
                                className="text-3xl md:text-4xl font-black text-[#0d141b] dark:text-white"
                            >
                                {t('about.vision_title')}
                            </h2>
                            <div className="space-y-6">
                                <VisionCard
                                    icon="school"
                                    title={t('about.v1_title')}
                                    description={t('about.v1_desc')}
                                />
                                <VisionCard
                                    icon="rocket_launch"
                                    title={t('about.v2_title')}
                                    description={t('about.v2_desc')}
                                />
                                <VisionCard
                                    icon="diversity_3"
                                    title={t('about.v3_title')}
                                    description={t('about.v3_desc')}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section
                    className="px-6 py-16 md:py-24 bg-white dark:bg-slate-900/50 rounded-[3rem]"
                    aria-labelledby="team-section-title"
                >
                    <div className="text-center mb-16 space-y-4">
                        <h2
                            id="team-section-title"
                            className="text-3xl md:text-5xl font-black text-[#0d141b] dark:text-white"
                        >
                            {t('about.team_title')}
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            {t('about.team_desc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {teamMembers.map((member) => (
                            <TeamMemberCard
                                key={member.id}
                                member={member}
                            />
                        ))}
                    </div>
                </section>

                {/* Partnerships Section */}
                <section
                    className="px-6 py-16 md:py-24"
                    aria-labelledby="partnerships-section-title"
                >
                    <div className="border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-16 flex flex-col items-center text-center space-y-12">
                        <div className="space-y-4 max-w-2xl">
                            <h2
                                id="partnerships-section-title"
                                className="text-3xl font-black text-[#0d141b] dark:text-white"
                            >
                                {t('about.partners_title')}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                {t('about.partners_desc')}
                            </p>
                        </div>

                        <div
                            className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                            role="list"
                            aria-label="Academic partnerships"
                        >
                            {partnerships.map((partner) => (
                                <div
                                    key={partner.id}
                                    className="h-10 bg-center bg-no-repeat bg-contain"
                                    style={{ backgroundImage: `url('${partner.logo}')` }}
                                    role="img"
                                    aria-label={partner.name}
                                ></div>
                            ))}
                        </div>

                        <div
                            className="pt-8 flex flex-wrap justify-center gap-6"
                            role="list"
                            aria-label="Certifications"
                        >
                            {certifications.map((cert) => (
                                <div
                                    key={cert.id}
                                    className="flex items-center gap-2 text-sm font-bold text-slate-500"
                                    role="listitem"
                                >
                                    <span className="material-symbols-outlined text-primary">{cert.icon}</span>
                                    {cert.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <Footer />
            </main>
        </div>
    );
};

// Composant VisionCard réutilisable
interface VisionCardProps {
    icon: string;
    title: string;
    description: string;
}

const VisionCard: React.FC<VisionCardProps> = ({ icon, title, description }) => {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <h3 className="font-bold text-lg mb-1">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{description}</p>
            </div>
        </div>
    );
};

// Composant TeamMemberCard réutilisable
interface TeamMemberCardProps {
    member: TeamMember;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
    return (
        <article
            className="group"
            aria-labelledby={`member - ${member.id} -name`}
        >
            <div
                className="aspect-[4/5] rounded-3xl bg-slate-200 dark:bg-slate-800 mb-6 overflow-hidden bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.02]"
                style={{ backgroundImage: `url('${member.image}')` }}
                role="img"
                aria-label={`Photo of ${member.name} `}
            ></div>
            <h3
                id={`member - ${member.id} -name`}
                className="text-xl font-bold"
            >
                {member.name}
            </h3>
            <p className="text-primary font-medium text-sm mb-3">{member.title}</p>
            <p className="text-slate-500 text-sm leading-relaxed">{member.bio}</p>
        </article>
    );
};



export default AboutPage;