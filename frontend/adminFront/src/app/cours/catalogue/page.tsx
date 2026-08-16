'use client';

import React from 'react';
import Link from 'next/link';
import { getAllCourses, Course } from '@/data/courses';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useLanguage } from '@/context/language-context';

const CourseCatalog: React.FC = () => {
  const { t } = useLanguage();
  // Récupérer tous les cours depuis le store
  const courses = getAllCourses();

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
      <Navbar />

      <main className="max-w-[1440px] mx-auto flex gap-8 px-6 md:px-10 py-8">
        {/* Sidebar Navigation (Filters) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{t('catalog.filters')}</h2>
              <button className="text-xs text-primary font-semibold hover:underline" aria-label="Reset filters">
                {t('catalog.reset')}
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('catalog.categories')}</p>
              <div className="space-y-1">
                <label className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 text-primary cursor-pointer transition-colors" aria-label="All Courses filter">
                  <span className="material-symbols-outlined text-[20px]">apps</span>
                  <span className="text-sm font-medium">{t('catalog.all_courses')}</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors text-slate-600 dark:text-slate-400" aria-label="Cloud Architecture filter">
                  <span className="material-symbols-outlined text-[20px]">cloud</span>
                  <span className="text-sm font-medium">{t('catalog.cloud_arch')}</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors text-slate-600 dark:text-slate-400" aria-label="IaC & Automation filter">
                  <span className="material-symbols-outlined text-[20px]">code</span>
                  <span className="text-sm font-medium">{t('catalog.iac_automation')}</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors text-slate-600 dark:text-slate-400" aria-label="CI/CD Pipelines filter">
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                  <span className="text-sm font-medium">{t('catalog.cicd')}</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors text-slate-600 dark:text-slate-400" aria-label="DevSecOps filter">
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                  <span className="text-sm font-medium">{t('catalog.devsecops')}</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors text-slate-600 dark:text-slate-400" aria-label="Observability filter">
                  <span className="material-symbols-outlined text-[20px]">monitoring</span>
                  <span className="text-sm font-medium">{t('catalog.observability')}</span>
                </label>
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="mb-6 border-t border-slate-100 dark:border-slate-800 pt-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('catalog.difficulty')}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" id="beg" type="checkbox" aria-label="Beginner courses" />
                  <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="beg">{t('catalog.beginner')}</label>
                </div>
                <div className="flex items-center gap-2">
                  <input className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" id="int" type="checkbox" defaultChecked aria-label="Intermediate courses" />
                  <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="int">{t('catalog.intermediate')}</label>
                </div>
                <div className="flex items-center gap-2">
                  <input className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" id="adv" type="checkbox" aria-label="Advanced courses" />
                  <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="adv">{t('catalog.advanced')}</label>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('catalog.duration')}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" id="dur1" type="checkbox" aria-label="0-5 hour courses" />
                  <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="dur1">0 - 5 {t('catalog.duration_hours')}</label>
                </div>
                <div className="flex items-center gap-2">
                  <input className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" id="dur2" type="checkbox" aria-label="5-15 hour courses" />
                  <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="dur2">5 - 15 {t('catalog.duration_hours')}</label>
                </div>
                <div className="flex items-center gap-2">
                  <input className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" id="dur3" type="checkbox" aria-label="15+ hour courses" />
                  <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="dur3">15+ {t('catalog.duration_hours')}</label>
                </div>
              </div>
            </div>
          </div>

          {/* Promo/Resources */}
          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-5 border border-primary/20" role="complementary">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{t('catalog.student_perk')}</p>
            <h3 className="font-bold text-sm mb-2">{t('catalog.claim_credits')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              {t('catalog.claim_desc')}
            </p>
            <button className="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg shadow-lg shadow-primary/20" aria-label="Claim AWS credits">
              {t('catalog.claim_btn')}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Hero Search & Chips Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('catalog.title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t('catalog.subtitle')}
            </p>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="block w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-primary focus:border-primary text-base"
                  placeholder={t('catalog.search_placeholder')}
                  type="text"
                  aria-label="Search courses"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative group">
                  <button
                    className="flex h-12 items-center justify-between gap-x-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 min-w-[140px]"
                    aria-label="Sort courses"
                  >
                    <span className="text-sm font-medium">{t('catalog.sort_by')}</span>
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </button>
                </div>
                <button
                  className="lg:hidden flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  aria-label="Open filters"
                >
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" role="group" aria-label="Course tags">
              <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-slate-900 text-white px-4" aria-pressed="true">
                <span className="text-xs font-medium">{t('catalog.all_tags')}</span>
              </button>
              <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 hover:bg-slate-200 dark:hover:bg-slate-700">
                <span className="text-xs font-medium">{t('catalog.cloud_native')}</span>
              </button>
              <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 hover:bg-slate-200 dark:hover:bg-slate-700">
                <span className="text-xs font-medium">{t('catalog.python_devops')}</span>
              </button>
              <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 hover:bg-slate-200 dark:hover:bg-slate-700">
                <span className="text-xs font-medium">{t('catalog.k8s_mastery')}</span>
              </button>
              <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 hover:bg-slate-200 dark:hover:bg-slate-700">
                <span className="text-xs font-medium">{t('catalog.security_first')}</span>
              </button>
            </div>
          </div>

          {/* Grid Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{t('catalog.showing_results').replace('24', courses.length.toString())}</h2>
            <div className="flex items-center gap-2" role="group" aria-label="View options">
              <button
                className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white"
                aria-label="Grid view"
                aria-pressed="true"
              >
                <span className="material-symbols-outlined block">grid_view</span>
              </button>
              <button
                className="p-1.5 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="List view"
              >
                <span className="material-symbols-outlined block">list</span>
              </button>
            </div>
          </div>

          {/* Course Card Grid - Avec liens vers les détails */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course: Course) => (
              <Link
                key={course.id}
                href={`/cours/${course.id}`}
                className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col block"
                aria-labelledby={`course-title-${course.id}`}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    {course.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${tag === 'AWS' ? 'bg-blue-500' :
                          tag === 'Intermediate' ? 'bg-emerald-500' :
                            tag === 'K8s' ? 'bg-indigo-600' :
                              tag === 'Advanced' ? 'bg-amber-500' :
                                tag === 'Security' ? 'bg-red-500' :
                                  tag === 'Specialty' ? 'bg-slate-600' :
                                    tag === 'Linux' ? 'bg-slate-500' :
                                      tag === 'Beginner' ? 'bg-emerald-500' :
                                        tag === 'GCP' ? 'bg-primary' : 'bg-cyan-600'
                          } text-white`}
                      >
                        {t(`catalog.${tag.toLowerCase().replace(' ', '_').replace('k8s', 'cloud_arch')}`) || tag}
                      </span>
                    ))}
                  </div>
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url('${course.image}')` }}
                    role="img"
                    aria-label={`Course cover image for ${course.title}`}
                  ></div>
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[...Array(5)].map((_: unknown, i: number) => (
                        <span
                          key={i}
                          className="material-symbols-outlined text-sm"
                          aria-hidden="true"
                        >
                          {i < Math.floor(course.rating) ? 'star' :
                            i === Math.floor(course.rating) && course.rating % 1 !== 0 ? 'star_half' : 'star_outline'}
                        </span>
                      ))}
                      <span className="text-white text-xs font-semibold ml-1">
                        {course.rating} ({course.reviews})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3
                    id={`course-title-${course.id}`}
                    className="text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors"
                  >
                    {t(`courses_data.${course.id.replace(/-/g, '_')}.title`) || course.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {t(`courses_data.${course.id.replace(/-/g, '_')}.description`) || course.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full bg-slate-200"
                        style={{ backgroundImage: `url('${course.avatar}')` }}
                        role="img"
                        aria-label={`Instructor ${course.instructor}`}
                      ></div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {course.instructor}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{course.duration}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center gap-1" aria-label="Course pagination">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                disabled
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-sm"
                aria-label="Page 1"
                aria-current="page"
              >
                1
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium" aria-label="Page 2">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium" aria-label="Page 3">3</button>
              <span className="px-2 text-slate-400 text-sm" aria-hidden="true">...</span>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium" aria-label="Page 8">8</button>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Next page"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </nav>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseCatalog;