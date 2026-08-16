export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  rating: number;
  reviews: string;
  tags: string[];
  image: string;
  avatar: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  originalPrice: number;
  discount: number;
  students: number;
  lastUpdated: string;
  subtitle: string;
  modules: Module[];
  prerequisites: Prerequisite[];
  features: Feature[];
  instructorDetails: Instructor;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'lab' | 'resource';
  duration?: string;
  isPreview?: boolean;
  questions?: number;
}

export interface Prerequisite {
  icon: string;
  title: string;
  description: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  avatar: string;
  courses: number;
  students: number;
  rating: number;
  socialLinks: SocialLink[];
}

export interface SocialLink {
  platform: 'linkedin' | 'github' | 'twitter';
  url: string;
}

// Store des cours - Accès par courses[id]
export const courses: Record<string, Course> = {
  'aws-terraform': {
    id: 'aws-terraform',
    title: 'Advanced AWS Infrastructure with Terraform',
    description: 'Master automated provisioning of complex cloud architectures using HCL and AWS services.',
    instructor: 'Dr. Sarah Jenkins',
    duration: '12.5 hrs',
    rating: 4.8,
    reviews: '2.4k',
    tags: ['AWS', 'Intermediate'],
    level: 'Intermediate',
    price: 94.99,
    originalPrice: 149.99,
    discount: 35,
    students: 12840,
    lastUpdated: '05/2024',
    subtitle: 'Master the art of provisioning enterprise-grade infrastructure',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000&auto=format&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    modules: [
      {
        id: 'module-1',
        title: 'Introduction to IaC',
        lessons: [
          { id: 'lesson-1-1', title: 'What is Terraform?', type: 'video', duration: '12:45', isPreview: true },
          { id: 'lesson-1-2', title: 'Installing the CLI & Setup', type: 'video', duration: '08:30' },
          { id: 'lesson-1-3', title: 'Core Concepts Quiz', type: 'quiz', questions: 5 },
        ],
      },
      {
        id: 'module-2',
        title: 'Terraform State Deep Dive',
        lessons: [
          { id: 'lesson-2-1', title: 'State Management', type: 'video', duration: '15:20' },
          { id: 'lesson-2-2', title: 'Remote State', type: 'video', duration: '18:45' },
        ],
      },
    ],
    prerequisites: [
      { icon: 'terminal', title: 'CLI Experience', description: 'Comfortable with Bash or Zsh' },
      { icon: 'cloud', title: 'AWS Basics', description: 'EC2, VPC, and S3 understanding' },
      { icon: 'code', title: 'Git Fundamentals', description: 'Branching and pull requests' },
    ],
    features: [
      { icon: 'ondemand_video', title: '24 hours', description: 'on-demand video' },
      { icon: 'terminal', title: '12 Guided', description: 'hands-on labs' },
      { icon: 'file_download', title: '45 Downloadable', description: 'resources' },
      { icon: 'workspace_premium', title: 'Certificate', description: 'of completion' },
    ],
    instructorDetails: {
      id: 'sarah-jenkins',
      name: 'Dr. Sarah Jenkins',
      title: 'Senior Cloud Architect',
      company: 'TechForge',
      bio: 'Sarah is a certified AWS Solutions Architect Professional with over 12 years of experience in automating large-scale cloud deployments.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      courses: 15,
      students: 145000,
      rating: 4.8,
      socialLinks: [
        { platform: 'linkedin', url: '#' },
        { platform: 'github', url: '#' },
      ],
    },
  },

  'kubernetes-mastery': {
    id: 'kubernetes-mastery',
    title: 'Kubernetes Production Operations',
    description: 'Deep dive into cluster management, autoscaling, and zero-downtime deployments at scale.',
    instructor: 'Mark Thompson',
    duration: '22 hrs',
    rating: 5.0,
    reviews: '1.1k',
    tags: ['K8s', 'Advanced'],
    level: 'Advanced',
    price: 119.99,
    originalPrice: 179.99,
    discount: 33,
    students: 8500,
    lastUpdated: '06/2024',
    subtitle: 'Deep dive into cluster management and zero-downtime deployments',
    image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07ca9?q=80&w=2000&auto=format&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    modules: [
      {
        id: 'module-1',
        title: 'Kubernetes Fundamentals',
        lessons: [
          { id: 'lesson-1-1', title: 'Cluster Architecture', type: 'video', duration: '18:30' },
          { id: 'lesson-1-2', title: 'Pods and Deployments', type: 'video', duration: '22:15' },
        ],
      },
    ],
    prerequisites: [
      { icon: 'terminal', title: 'Linux CLI', description: 'Comfortable with Linux commands' },
      { icon: 'cloud', title: 'Docker Basics', description: 'Understanding of containers' },
    ],
    features: [
      { icon: 'ondemand_video', title: '22 hours', description: 'on-demand video' },
      { icon: 'terminal', title: '15 Guided', description: 'hands-on labs' },
    ],
    instructorDetails: {
      id: 'mark-thompson',
      name: 'Mark Thompson',
      title: 'Principal DevOps Engineer',
      company: 'CloudScale Inc',
      bio: 'Mark has managed Kubernetes clusters at scale for Fortune 500 companies...',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      courses: 8,
      students: 95000,
      rating: 4.9,
      socialLinks: [
        { platform: 'linkedin', url: '#' },
        { platform: 'github', url: '#' },
      ],
    },
  },
};

// Helper functions
export const getCourseById = (id: string): Course | undefined => {
  return courses[id];
};

export const getAllCourses = (): Course[] => {
  return Object.values(courses);
};

export const getCoursesByCategory = (category: string): Course[] => {
  return Object.values(courses).filter(course =>
    course.tags.some(tag => tag.toLowerCase() === category.toLowerCase())
  );
};

export const searchCourses = (query: string): Course[] => {
  const searchTerm = query.toLowerCase();
  return Object.values(courses).filter(course =>
    course.title.toLowerCase().includes(searchTerm) ||
    course.description.toLowerCase().includes(searchTerm) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};