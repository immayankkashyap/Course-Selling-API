import { password } from "bun";
import * as z from "zod";

const signupSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string().min(6),
    role: z.enum(['Student','Instructor'])
})

const signinSchema = z.object({
    email: z.email(),
    password : z.string().min(6),

})

const createCourseSchema = z.object({
    title:z.string(),
    description: z.string().optional(),
    price : z.number(),
})

const createLessonSchema = z.object({
    title: z.string(),
    content: z.string(),
    courseId: z.string(),   
})

const purchaseCourseSchema = z.object({
    courseId: z.uuid(),
})

export {
    signinSchema,
    signupSchema,
    createCourseSchema,
    createLessonSchema,
    purchaseCourseSchema,
}