export interface Course {
  _id?: string; // MongoDB ID
  id: string;   // Frontend ID/Slug
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorId: string;
  duration: string;
  rating: number;
  ratingsQuantity: number;
  reviews: string;
  tags: string[];
  image: string; // Map to imageCover from backend
  imageCover: string; // Direct access to backend field
  avatar: string; // Map to instructorDetails.avatar
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  originalPrice: number;
  discount: number;
  students: number;
  studentsId: string[];
  lastUpdated: string;
  subtitle: string;
  modules: Module[];
  lessons: number;
  prerequisites: Prerequisite[];
  features: Feature[];
  instructorDetails: Instructor;
  ratingDistribution?: Record<string, number>;
  bestseller?: boolean;
  isArchived?: boolean;
}

export interface Module {
  _id?: string;
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  exercises?: Exercise[];
}

export interface Lesson {
  _id?: string;
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'lab' | 'resource';
  duration?: string;
  description?: string;
  content?: string;
  noteContent?: string;
  isPreview?: boolean;
  questions?: number;
  exercises?: Exercise[];
  videoFile?: string;
  videoThumbnail?: string;
  videoSource?: 'url' | 'upload';
  videoUrl?: string; // Mapped full URL
  thumbnailUrl?: string; // Mapped thumbnail URL
  pdfFile?: string;
  pdfUrl?: string; // Mapped full URL
}

export interface Exercise {
  _id?: string;
  id: string;
  moduleId?: string;
  title: string;
  type: 'coding' | 'quiz' | 'boolean';
  instructions?: string;
  maxScore?: number;
  timeLimit?: number;
  // Coding fields
  language?: string;
  initialCode?: string;
  solution?: string;
  assertions?: string;
  // Quiz fields
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  // Boolean fields
  correctAnswer?: boolean;
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

export const API_BASE_URL = process.env.NEXT_PUBLIC_COURSE_API_URL;
export const INSCRIPTION_API_URL = process.env.NEXT_PUBLIC_INSCRIPTION_API_URL as string;
export const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_COURSE_IMAGE_URL;
export const VIDEO_BASE_URL = process.env.NEXT_PUBLIC_COURSE_VIDEO_URL;
export const DOC_BASE_URL = process.env.NEXT_PUBLIC_COURSE_DOC_URL;
export const PROGRESS_API_URL = process.env.NEXT_PUBLIC_PROGRESS_API_URL as string;

// Helper to map backend course to frontend Course interface
const mapCourse = (backendCourse: any): Course => {
  return {
    ...backendCourse,
    isArchived: backendCourse.isArchived || false,
    studentsId: backendCourse.studentsId || [],
    id: backendCourse.slug || backendCourse._id,
    modules: (backendCourse.modules || []).map((mod: any) => {
      const moduleId = mod._id || mod.id;
      return {
        ...mod,
        id: mod.id || mod._id,
        _id: mod._id,
        lessons: (mod.lessons || []).map((less: any) => ({
          ...less,
          id: less.id || less._id,
          _id: less._id,
          moduleId: moduleId, // Propagate moduleId to lesson
          videoUrl: (less.videoSource === 'upload' && less.videoFile)
            ? `${VIDEO_BASE_URL}/${less.videoFile}`
            : (less.videoUrl || (less.videoFile ? `${VIDEO_BASE_URL}/${less.videoFile}` : undefined)),
          thumbnailUrl: less.videoThumbnail ? `${IMAGE_BASE_URL}/${less.videoThumbnail}` : undefined,
          pdfUrl: less.pdfFile ? `${DOC_BASE_URL}/${less.pdfFile}` : undefined,
          exercises: (less.exercises || less.exercisesID || []).map((ex: any) => ({
            ...ex,
            id: ex.id || ex._id,
            _id: ex._id,
            moduleId: moduleId // Propagate moduleId to exercise
          }))
        })),
        exercises: (mod.exercises || mod.exercisesID || []).map((ex: any) => ({
          ...ex,
          id: ex.id || ex._id,
          _id: ex._id,
          moduleId: moduleId // Propagate moduleId to exercise
        }))
      };
    }),
    lessons: (backendCourse.modules || []).reduce((acc: number, mod: any) => acc + (mod.lessons || []).length, 0),
    imageCover: backendCourse.imageCover,
    image: backendCourse.imageCover?.startsWith('http')
      ? backendCourse.imageCover
      : backendCourse.imageCover
        ? `${IMAGE_BASE_URL}/${backendCourse.imageCover}`
        : '/course-placeholder.png',
    avatar: backendCourse.instructorDetails?.avatar?.startsWith('http')
      ? backendCourse.instructorDetails.avatar
      : `${IMAGE_BASE_URL}/${backendCourse.instructorDetails?.avatar || 'default-avatar.png'}`,
    instructorDetails: backendCourse.instructorDetails ? {
      ...backendCourse.instructorDetails,
      avatar: backendCourse.instructorDetails.avatar?.startsWith('http')
        ? backendCourse.instructorDetails.avatar
        : `${IMAGE_BASE_URL}/${backendCourse.instructorDetails.avatar || 'default-avatar.png'}`
    } : {
      id: backendCourse.instructorId || 'unknown',
      name: backendCourse.instructor || 'Instructor',
      title: 'Course Instructor',
      company: 'E-Learning',
      bio: 'Bio not available for this instructor.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      courses: 0,
      students: 0,
      rating: 0,
      socialLinks: []
    },
    instructor: backendCourse.instructor || 'Instructor'
  };
};

const USER_API_URL = process.env.NEXT_PUBLIC_USER_API_URL as string;

const resolveInstructors = async (courses: Course[]) => {
  const uniqueIds = Array.from(new Set(courses.map(c => c.instructorId).filter(id => id && id !== 'unknown')));

  const instructorMap: Record<string, any> = {};

  await Promise.all(uniqueIds.map(async (id) => {
    try {
      const res = await fetch(`${USER_API_URL}/auth/public/${id}`);
      if (res.ok) {
        const result = await res.json();
        instructorMap[id] = result.data;
      }
    } catch (e) {
      console.warn(`Could not resolve instructor ${id}`, e);
    }
  }));

  courses.forEach(course => {
    if (instructorMap[course.instructorId]) {
      const data = instructorMap[course.instructorId];
      course.instructor = data.name;
      course.instructorDetails.name = data.name;
      if (data.avatar) {
        course.instructorDetails.avatar = data.avatar.startsWith('http')
          ? data.avatar
          : `${IMAGE_BASE_URL}/${data.avatar}`;
      }
    }
  });
};



export const getStudentCounts = async (): Promise<Record<string, number>> => {
  try {
    const response = await fetch(`${INSCRIPTION_API_URL}/inscriptions/counts`);
    if (!response.ok) return {};
    const result = await response.json();
    return result.data || {};
  } catch (error) {
    console.error('Error fetching student counts:', error);
    return {};
  }
};

export const getCourseStudentCount = async (courseId: string): Promise<number> => {
  try {
    const response = await fetch(`${INSCRIPTION_API_URL}/inscriptions/count/${courseId}`);
    if (!response.ok) return 0;
    const result = await response.json();
    return result.data || 0;
  } catch (error) {
    console.error(`Error fetching student count for ${courseId}:`, error);
    return 0;
  }
};

export const getUniqueStudentCount = async (courseIds: string[]): Promise<number> => {
  const token = localStorage.getItem('user-token');
  try {
    const response = await fetch(`${INSCRIPTION_API_URL}/inscriptions/unique-count`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ courseIds })
    });
    if (!response.ok) return 0;
    const result = await response.json();
    return result.data || 0;
  } catch (error) {
    console.error('Error fetching unique student count:', error);
    return 0;
  }
};

export const getCourseStudents = async (courseId: string) => {
  const token = localStorage.getItem('user-token');
  try {
    const response = await fetch(`${INSCRIPTION_API_URL}/inscriptions/course-students/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) return [];
    const result = await response.json();
    const inscriptions = result.data || [];

    // Resolve user details for each student
    const studentInfo = await Promise.all(inscriptions.map(async (ins: any) => {
      try {
        const userRes = await fetch(`${USER_API_URL}/auth/public/${ins.userId}`);
        const userData = userRes.ok ? (await userRes.json()).data : null;
        return {
          id: ins.userId,
          name: userData?.name || 'Student',
          email: userData?.email || 'N/A',
          avatar: userData?.avatar
            ? (userData.avatar.startsWith('http') ? userData.avatar : `${IMAGE_BASE_URL}/${userData.avatar}`)
            : null,
          enrolledAt: ins.createdAt,
          pricePaid: ins.price
        };
      } catch (e) {
        return {
          id: ins.userId,
          name: 'Student',
          email: 'N/A',
          enrolledAt: ins.createdAt,
          pricePaid: ins.price
        };
      }
    }));

    return studentInfo;
  } catch (error) {
    console.error('Error fetching course students:', error);
    return [];
  }
};

export const getStudentProgress = async (courseId: string, userId: string): Promise<string[]> => {
  const token = localStorage.getItem('user-token');
  try {
    const response = await fetch(`${PROGRESS_API_URL}/course-progress/${courseId}?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) return [];

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return [];
  }
};

export interface PaginationResponse {
  data: Course[];
  pagination: {
    currentPage: number;
    limit: number;
    totalDocuments: number;
    totalPages: number;
  };
}

export const getAllCourses = async (page = 1, limit = 10): Promise<PaginationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses?page=${page}&limit=${limit}`);
    const data = await response.json();
    const backendCourses = (data.data || []).map(mapCourse);

    await resolveInstructors(backendCourses);

    // Fetch student counts and merge
    const counts = await getStudentCounts();
    backendCourses.forEach((c: Course) => {
      // Try matching by _id or id
      c.students = counts[c._id || ''] || counts[c.id] || 0;
    });

    return {
      data: backendCourses,
      pagination: data.pagination || {
        currentPage: page,
        limit: limit,
        totalDocuments: backendCourses.length,
        totalPages: Math.ceil(backendCourses.length / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return {
      data: [],
      pagination: {
        currentPage: 1,
        limit: 10,
        totalDocuments: 0,
        totalPages: 0
      }
    };
  }
};

export const getCourseById = async (id: string): Promise<Course | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    if (!response.ok) {
      throw new Error('Course not found via API');
    }
    const data = await response.json();
    const course = mapCourse(data.data);
    await resolveInstructors([course]);

    // Fetch student count
    course.students = await getCourseStudentCount(course._id || course.id);

    return course;
  } catch (error) {
    console.warn(`Direct fetch for course ${id} failed, trying fallback list...`, error);
    try {
      const response = await getAllCourses(1, 100); // Fetch more for fallback
      return response.data.find((c: Course) => c.id === id || c._id === id || c.title.toLowerCase().replace(/ /g, '-') === id);
    } catch (fallbackError) {
      console.error('Fallback course fetch failed:', fallbackError);
      return undefined;
    }
  }
};

export const getCoursesByCategory = async (category: string): Promise<Course[]> => {
  const result = await getAllCourses(1, 100);
  return result.data.filter((course: Course) =>
    course.tags.some((tag: string) => tag.toLowerCase() === category.toLowerCase())
  );
};

export const searchCourses = async (query: string): Promise<Course[]> => {
  const searchTerm = query.toLowerCase();
  const result = await getAllCourses(1, 100);
  return result.data.filter((course: Course) =>
    course.title.toLowerCase().includes(searchTerm) ||
    course.description.toLowerCase().includes(searchTerm) ||
    course.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
  );
};

export const getInstructorCourses = async (instructorId: string): Promise<Course[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses?limit=100`);
    if (!response.ok) return [];
    const data = await response.json();
    const backendCourses = (data.data || []).map(mapCourse);

    await resolveInstructors(backendCourses);

    const instructorCourses = backendCourses.filter((course: Course) => course.instructorId === instructorId);

    // Fetch student counts
    const counts = await getStudentCounts();
    instructorCourses.forEach((c: Course) => {
      c.students = counts[c._id || ''] || counts[c.id] || 0;
    });

    return instructorCourses;
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    return [];
  }
};

export const cours = async (courseData: any): Promise<Course> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  const data = { ...courseData };

  // Remove modules from root payload as they are created separately
  delete data.modules;

  if (courseData.imageCover instanceof File) {
    formData.append('imageCover', courseData.imageCover);
    data.imageCover = courseData.imageCover.name;
  }

  formData.append('data', JSON.stringify(data));

  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create course');
  }
  const result = await response.json();
  return mapCourse(result.data);
};

export const createModule = async (moduleData: any): Promise<any> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/modules`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(moduleData)
  });
  if (!response.ok) throw new Error('Failed to create module');
  const result = await response.json();
  return result.data;
};

export const updateModule = async (id: string, moduleData: any): Promise<any> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/modules/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(moduleData)
  });
  if (!response.ok) throw new Error('Failed to update module');
  const result = await response.json();
  return result.data;
};

export const createLesson = async (lessonData: any): Promise<any> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  const data = { ...lessonData };

  // Handle files
  if (lessonData.videoFile instanceof File) {
    formData.append('videoFile', lessonData.videoFile);
    data.videoFile = lessonData.videoFile.name;
  }
  if (lessonData.pdfFile instanceof File) {
    formData.append('pdfFile', lessonData.pdfFile);
    data.pdfFile = lessonData.pdfFile.name;
  }

  formData.append('data', JSON.stringify(data));

  const response = await fetch(`${API_BASE_URL}/lessons`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  if (!response.ok) throw new Error('Failed to create lesson');
  const result = await response.json();
  return result.data;
};

export const updateLesson = async (id: string, lessonData: any): Promise<any> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  const data = { ...lessonData };

  // Handle files if they are File objects (newly uploaded)
  if (lessonData.videoFile instanceof File) {
    formData.append('videoFile', lessonData.videoFile);
    data.videoFile = lessonData.videoFile.name;
  }
  if (lessonData.pdfFile instanceof File) {
    formData.append('pdfFile', lessonData.pdfFile);
    data.pdfFile = lessonData.pdfFile.name;
  }

  formData.append('data', JSON.stringify(data));

  const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  if (!response.ok) throw new Error('Failed to update lesson');
  const result = await response.json();
  return result.data;
};

export const createExercise = async (exerciseData: any): Promise<any> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/exercises`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(exerciseData)
  });
  if (!response.ok) throw new Error('Failed to create exercise');
  const result = await response.json();
  return result.data;
};

export const updateExercise = async (id: string, exerciseData: any): Promise<any> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/exercises/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(exerciseData)
  });
  if (!response.ok) throw new Error('Failed to update exercise');
  const result = await response.json();
  return result.data;
};

export const update = async (id: string, courseData: any): Promise<Course> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  const data = { ...courseData };

  if (courseData.imageCover instanceof File) {
    formData.append('imageCover', courseData.imageCover);
    data.imageCover = courseData.imageCover.name;
  }

  delete data.modules;

  formData.append('data', JSON.stringify(data));

  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update course');
  }
  const result = await response.json();
  return result.data ? mapCourse(result.data) : ({} as Course);
};

export const deleteCourse = async (id: string): Promise<void> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete course');
  }
};

export const deleteModule = async (id: string): Promise<void> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/modules/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete module');
  }
};

export const deleteLesson = async (id: string): Promise<void> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete lesson');
  }
};

export const deleteExercise = async (id: string): Promise<void> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/exercises/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete exercise');
  }
};

export const enrollInCourse = async (courseId: string): Promise<any> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${INSCRIPTION_API_URL}/inscriptions/enroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ courseId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Enrollment failed');
  }

  return await response.json();
};

export const createCheckoutSession = async (courseId: string, courseTitle: string, price: number): Promise<{ session: { url: string } }> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${INSCRIPTION_API_URL}/inscriptions/checkout-session/${courseId}?courseTitle=${encodeURIComponent(courseTitle)}&price=${price}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return await response.json();
};

export const checkEnrollment = async (courseId: string): Promise<boolean> => {
  const token = localStorage.getItem('user-token');
  if (!token) return false;

  try {
    const response = await fetch(`${INSCRIPTION_API_URL}/inscriptions/check/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) return false;
    const result = await response.json();

    // Support both boolean response and list of enrolled IDs
    if (typeof result.isEnrolled === 'boolean') {
      return result.isEnrolled;
    }

    // If the API returns a list of enrolled courses/IDs
    if (Array.isArray(result.data)) {
      return result.data.some((item: any) => {
        const id = typeof item === 'object' ? (item.courseId || item._id) : item;
        return id === courseId;
      });
    }

    return false;
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return false;
  }
};

export const getMyEnrolledCourses = async (): Promise<Course[]> => {
  const token = localStorage.getItem('user-token');
  if (!token) return [];

  try {
    const response = await fetch(`${INSCRIPTION_API_URL}/inscriptions/my-courses`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) return [];
    const result = await response.json();

    // The API might return an array of IDs or an array of enrollment objects
    // If it's objects, we need to extract the 'courseId' field.
    const rawData = result.data || [];
    const courseIds = rawData.map((item: any) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') return item.courseId || item._id;
      return null;
    }).filter(Boolean);

    if (courseIds.length === 0) return [];

    // Fetch full course details for these IDs in parallel
    const courses = await Promise.all(
      courseIds.map(async (id: string) => {
        try {
          // Use getCourseById which handles both Slug and MongoDB _id
          return await getCourseById(id);
        } catch (err) {
          console.error(`Failed to fetch course detail for ${id}`, err);
          return null;
        }
      })
    );

    return courses.filter(Boolean) as Course[];
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return [];
  }
};



export const createReview = async (courseId: string, ratings: number, title?: string): Promise<any> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ course: courseId, ratings, title })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit review');
  }

  return await response.json();
};

export const getCourseReviews = async (courseId: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/reviews/course/${courseId}`);
  if (!response.ok) return [];
  const result = await response.json();
  return result.data || [];
};

export const getUserReview = async (courseId: string): Promise<any> => {
  const token = localStorage.getItem('user-token');
  if (!token) return null;

  const response = await fetch(`${API_BASE_URL}/reviews/my-review/${courseId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) return null;
  const result = await response.json();
  return result.data;
};

export const updateReview = async (reviewId: string, ratings: number, title?: string): Promise<any> => {
  const token = localStorage.getItem('user-token');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ratings, title })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update review');
  }

  return await response.json();
};

// Compatibility
export const courses: Record<string, Course> = {};

