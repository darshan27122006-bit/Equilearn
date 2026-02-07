
import { Language } from '@/app/types';

export interface Classroom {
    id: string;
    name: string;
    subject: string;
    description?: string;
    teacherId?: string;
    studentCount: number;
    allowedLanguages?: string[];
    createdAt: string;
}

const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const classroomService = {
    // Generic list (filters based on role in backend)
    getClassrooms: async (): Promise<Classroom[]> => {
        try {
            const res = await fetch('/api/classrooms/', { headers: getAuthHeader() });
            if (res.ok) {
                const data = await res.json();
                return data.classrooms || [];
            }
            return [];
        } catch (e) {
            console.error("Error fetching classrooms:", e);
            return [];
        }
    },

    // Role specific list
    getAssignedClassrooms: async (): Promise<Classroom[]> => {
        try {
            const res = await fetch('/api/teacher/get_assigned_classrooms', { headers: getAuthHeader() });
            if (res.ok) {
                const data = await res.json();
                return data.classrooms || [];
            }
            return [];
        } catch (e) {
            console.error("Error fetching teacher classrooms:", e);
            return [];
        }
    },

    getMyClassrooms: async (): Promise<Classroom[]> => {
        try {
            const res = await fetch('/api/student/get_my_classrooms', { headers: getAuthHeader() });
            if (res.ok) {
                const data = await res.json();
                return data.classrooms || [];
            }
            return [];
        } catch (e) {
            console.error("Error fetching student classrooms:", e);
            return [];
        }
    },

    // Creation
    createClassroom: async (name: string, subject: string, description: string = '', allowedLanguages: string[] = []): Promise<any> => {
        try {
            const res = await fetch('/api/classrooms/', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ name, subject, description, allowedLanguages })
            });
            return await res.json();
        } catch (e) {
            return { success: false, error: "Network error" };
        }
    },

    // Assignment
    assignTeacher: async (classroomId: string, teacherId: string): Promise<any> => {
        try {
            const res = await fetch('/api/admin/assign_teacher_to_classroom', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ classroomId, teacherId })
            });
            return await res.json();
        } catch (e) {
            return { success: false, error: "Network error" };
        }
    },

    addStudent: async (classroomId: string, studentId: string): Promise<any> => {
        try {
            // Admins and teachers use the same logic path in backend
            const res = await fetch('/api/teacher/add_student_to_classroom', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ classroomId, studentId })
            });
            return await res.json();
        } catch (e) {
            return { success: false, error: "Network error" };
        }
    },

    getClassroomContent: async (classroomId: string): Promise<any[]> => {
        try {
            const res = await fetch(`/api/student/get_classroom_content?classroomId=${classroomId}`, {
                headers: getAuthHeader()
            });
            if (res.ok) {
                const data = await res.json();
                return data.contents || [];
            }
            return [];
        } catch (e) {
            return [];
        }
    }
};
