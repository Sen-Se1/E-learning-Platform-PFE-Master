"use client"

import React, { useState } from "react"
import { Play, Volume2, Settings, Maximize, SkipBack, SkipForward, VideoOff, CheckCircle2 } from "lucide-react"
import { Lesson, Course } from "@/data/courses"
import { Badge } from "@/components/ui/badge"

interface VideoAreaProps {
    currentLesson: Lesson;
    course: Course;
    onEnded?: () => void;
}

export function VideoArea({ currentLesson, course, onEnded }: VideoAreaProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const lessonId = currentLesson?.id || currentLesson?._id;
    const videoUrl = currentLesson?.videoUrl;

    // --- PLATFORM DETECTION (Stable) ---
    const platform = React.useMemo(() => {
        if (!videoUrl) return null;
        if (currentLesson.videoSource === 'upload') return 'native';

        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) return 'youtube';
        if (videoUrl.includes('vimeo.com')) return 'vimeo';

        const extension = videoUrl.split('.').pop()?.toLowerCase();
        if (['mp4', 'webm', 'ogg', 'mov'].includes(extension || '')) return 'native';

        return 'iframe';
    }, [videoUrl, currentLesson.videoSource]);

    // --- TIME TRACKING LOGIC ---
    React.useEffect(() => {
        if (!isPlaying || !lessonId) return;

        const interval = setInterval(() => {
            const storageKey = `time_spent_${lessonId}`;
            const currentSpent = parseInt(localStorage.getItem(storageKey) || "0");
            localStorage.setItem(storageKey, (currentSpent + 1).toString());
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying, lessonId]);

    // --- YOUTUBE API ---
    React.useEffect(() => {
        if (platform !== 'youtube' || !hasStarted) return;

        let player: any = null;
        let isDestroyed = false;

        const initYouTubePlayer = () => {
            if (isDestroyed) return;
            const YT = (window as any).YT;
            if (!YT || !YT.Player) {
                setTimeout(initYouTubePlayer, 100);
                return;
            }

            try {
                player = new YT.Player('youtube-player', {
                    events: {
                        'onStateChange': (event: any) => {
                            if (event.data === YT.PlayerState.ENDED && onEnded) onEnded();
                            if (event.data === YT.PlayerState.PLAYING) setIsPlaying(true);
                            if (event.data === YT.PlayerState.PAUSED) setIsPlaying(false);
                            // Do not set isPlaying to false on buffering to avoid UI flickers if any
                        }
                    }
                });
            } catch (e) {
                console.error("Failed to init YT player", e);
            }
        };

        if (!(window as any).YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        }

        setTimeout(initYouTubePlayer, 100);
        return () => {
            isDestroyed = true;
            if (player?.destroy) player.destroy();
        };
    }, [platform, hasStarted, onEnded]);

    // --- VIMEO API ---
    React.useEffect(() => {
        if (platform !== 'vimeo' || !hasStarted) return;

        let vimeoPlayer: any = null;

        const initVimeo = () => {
            const Vimeo = (window as any).Vimeo;
            if (!Vimeo || !Vimeo.Player) {
                const tag = document.createElement('script');
                tag.src = "https://player.vimeo.com/api/player.js";
                tag.onload = () => initVimeo();
                document.head.appendChild(tag);
                return;
            }

            const frame = document.getElementById('vimeo-player') as HTMLIFrameElement;
            if (frame) {
                vimeoPlayer = new Vimeo.Player(frame);
                vimeoPlayer.on('ended', () => onEnded && onEnded());
                vimeoPlayer.on('play', () => setIsPlaying(true));
                vimeoPlayer.on('pause', () => setIsPlaying(false));
            }
        };

        initVimeo();
        return () => {
            if (vimeoPlayer) vimeoPlayer.unload();
        };
    }, [platform, hasStarted, onEnded]);

    const handleStartPlayback = () => {
        setHasStarted(true);
        setIsPlaying(true);
    };

    const getYouTubeId = (url: string) => {
        if (!url) return null;
        if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
        if (url.includes('youtu.be/')) return url.split('youtu.be/')[1];
        return null;
    };

    const getVimeoId = (url: string) => {
        if (!url) return null;
        return url.split('/').pop();
    };

    const videoPreviewUrl = React.useMemo(() => {
        if (currentLesson.thumbnailUrl) return currentLesson.thumbnailUrl;
        if (currentLesson.videoThumbnail) return currentLesson.videoThumbnail;

        if (platform === 'youtube') {
            const id = getYouTubeId(videoUrl || "");
            return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : (course.image || "");
        }

        if (platform === 'vimeo') {
            const id = getVimeoId(videoUrl || "");
            return id ? `https://vumbnail.com/${id}.jpg` : (course.image || "");
        }

        return course.image || "";
    }, [currentLesson.thumbnailUrl, currentLesson.videoThumbnail, platform, videoUrl, course.image]);

    const getYouTubeEmbedUrl = (url: string) => {
        const videoId = getYouTubeId(url);
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1&origin=${origin}`;
    };

    const getVimeoEmbedUrl = (url: string) => {
        const videoId = getVimeoId(url);
        return `https://player.vimeo.com/video/${videoId}?autoplay=1&badge=0&autopause=0&player_id=0&app_id=58479`;
    };

    return (
        <div className="relative group/player w-full overflow-hidden bg-[#020617] aspect-video flex items-center justify-center transition-all border-b border-white/5 shadow-2xl">
            {videoUrl ? (
                <div className="w-full h-full relative group">
                    {/* Platform Specific Rendering */}
                    {hasStarted ? (
                        <div className="w-full h-full">
                            {platform === 'youtube' && (
                                <iframe
                                    id="youtube-player"
                                    className="w-full h-full border-0"
                                    src={getYouTubeEmbedUrl(videoUrl)}
                                    title={currentLesson.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            )}
                            {platform === 'vimeo' && (
                                <iframe
                                    id="vimeo-player"
                                    className="w-full h-full border-0"
                                    src={getVimeoEmbedUrl(videoUrl)}
                                    title={currentLesson.title}
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                />
                            )}
                            {platform === 'native' && (
                                <video
                                    ref={videoRef}
                                    key={currentLesson.id || currentLesson._id}
                                    className="w-full h-full object-contain"
                                    src={`${videoUrl}#t=0.1`}
                                    preload="auto"
                                    playsInline
                                    crossOrigin="anonymous"
                                    controls
                                    autoPlay
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onEnded={onEnded}
                                />
                            )}
                            {platform === 'iframe' && (
                                <iframe
                                    className="w-full h-full border-0"
                                    src={videoUrl}
                                    title={currentLesson.title}
                                    allowFullScreen
                                />
                            )}
                        </div>
                    ) : (
                        /* Placeholder / Cover State */
                        <div
                            className="w-full h-full relative cursor-pointer group"
                            onClick={handleStartPlayback}
                        >
                            {platform === 'native' && (!currentLesson.thumbnailUrl && !currentLesson.videoThumbnail) ? (
                                <video
                                    src={`${videoUrl}#t=0.1`}
                                    className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
                                    preload="metadata"
                                    muted
                                    playsInline
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <img
                                    src={videoPreviewUrl}
                                    alt={currentLesson.title}
                                    className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => {
                                        if (e.currentTarget.src !== course.image) {
                                            e.currentTarget.src = course.image || "/images/course-placeholder.jpg"
                                        }
                                    }}
                                />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-all duration-500">
                                <div className="size-20 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 transition-all duration-300 group-hover:scale-110 group-active:scale-90 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <Play className="size-8 fill-current ml-1 relative z-10" />
                                </div>
                            </div>
                            <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Preview Mode Active</span>
                            </div>
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-[9px] font-black uppercase tracking-[0.4em] bg-black/60 px-6 py-2.5 rounded-full backdrop-blur-md border border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                Launch Session
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#020617] relative text-center px-8">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px]" />
                    <VideoOff className="w-12 h-12 text-slate-700 mb-6" />
                    <Badge variant="outline" className="mb-4 border-blue-500/20 bg-blue-500/5 text-blue-400">
                        {currentLesson.type || 'Resource'}
                    </Badge>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Non-Video Content</h3>
                    <p className="text-slate-500 text-sm mt-3 max-w-sm mx-auto">
                        This session consists of technical documentation and resources available below.
                    </p>
                </div>
            )}
        </div>
    );
}
