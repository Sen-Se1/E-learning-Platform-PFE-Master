export interface Exercise {
    id: string;
    type: 'coding' | 'quiz' | 'boolean';
    title: string;
    instructions: string;
    maxScore: number;
    timeLimit?: number; // in minutes
    // Coding specific
    language?: string;
    initialCode?: string;
    solution?: string;
    assertions?: string;
    // Quiz specific
    options?: { id: string; text: string; isCorrect: boolean }[];
    // Boolean specific
    correctAnswer?: boolean;
}

export interface LessonData {
    id: string;
    title: string;
    type: string;
    duration?: string;
    isPreview?: boolean;
    questions?: number;
    instructor?: string;
    content?: string;
    language?: string;
    layout?: string;
    videoUrl?: string;
    videoSource?: 'url' | 'upload';
    videoFile?: string | File;
    pdfFile?: string | File;
    hasTextContent?: boolean;
    description?: string;
    resources?: string[];
    exercises?: Exercise[];
}

export interface ModuleData {
    id: string;
    title: string;
    description?: string;
    lessons: LessonData[];
    exercises?: Exercise[];
}

export interface CourseFormData {
    title: string;
    slug: string;
    subtitle: string;
    description: string;
    category: string;
    level: string;
    price: string;
    imageCover: string | File;
    tags: string;
    modules: ModuleData[];
}
