import { Router } from "express";
import * as jwt from 'jsonwebtoken'
import { createCourseSchema } from "../schema";
import type { Request, Response } from "express";
import { config } from "dotenv";
import { authMiddleware } from "../middlewares/auth";
import { prisma } from '../db.ts'
import { string } from "zod";
config();

const CourseRouter = Router();


// create courses (only admins/instructor)
CourseRouter.post('/courses', authMiddleware, async (req: Request, res: Response) => {
    const result = createCourseSchema.safeParse(req.body)
    if (req.role != 'Instructor') {
        res.status(403).send({
            err: "Unauthorized access"
        })
    } else if (!result.success) {
        console.log("Invalid input")
        res.status(400).send({
            err: "Invalid input!"
        })
    } else {
        const courseInfo: {
            InstructorId: string,
            title: string,
            price: number,
            description: string
        } = {
            InstructorId: req.userId!,
            title: result.data.title!,
            price: result.data?.price!,
            description: result.data?.description!,
        };

        try {
            const course = await prisma.course.create({
                data: courseInfo
            })
            return res.status(200).send({
                id: course.id,

            })

        } catch (err) {
            console.log(err)
            return res.status(500).send({
                err,
            })
        }
    }

})

// get all available courses
CourseRouter.get('/courses', async (req: Request, res: Response) => {
    try {
        const AllCourses = await prisma.course.findMany({})
        res.status(200).send({
            AllCourses,
        })
    }
    catch (err) {
        res.status(401).send({
            err,
        })
    }
})

// open a course and show all underline lessons
CourseRouter.get('/courses/:id', authMiddleware, async (req: Request, res: Response) => {
    const courseId = req.params.id;
    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId as string },
            include: {
                lessons: true,
                purchases: true,
            }
        })
        
        // Check if course exists first
        if (!course) {
            return res.status(404).send({
                message: "Course not found!"
            })
        }

        //check if user has purchased access
        const hasAccess = course.purchases.some(p => p.userId === req.userId);
        if (!hasAccess) {
            return res.status(403).send({ err: "Purchase required" });
        }

        return res.status(200).send({
            course,
        })
    } catch (err) {
        return res.status(401).send({
            err,
        })
    }
})


// only instructor
CourseRouter.patch('/courses/:id', authMiddleware, async (req: Request, res: Response) => {
    const courseId = req.params.id;
    const role = req.role;
    const result = createCourseSchema.partial().safeParse(req.body)
    if (!result.success) {
        return res.status(400).send({
            err: "Zod validation failed! "
        })
    } else if (role != 'Instructor') {
        return res.status(403).send({
            err: "Unauthorized access!"
        })
    } else {
        try {
            const updateCourse = await prisma.course.update({
                where: {
                    id: courseId as string,
                },
                data: result.data
            })
            console.log(`Patched with course id ${courseId}.`)
            return res.status(200).json(updateCourse)
        } catch (err) {
            return res.status(404).send({
                err,
            })
        }
    }

})


// can be deleted only by instructor
CourseRouter.delete('/courses/:id', authMiddleware, async (req: Request, res: Response) => {
    const courseId = req.params.id;
    const role = req.role;
    if (role == "Instructor") {
        try {
            const deleted = await prisma.course.delete({
                where: {
                    id: courseId as string
                }
            })
            console.log(`Patched the course with id ${courseId}`)
            return res.status(200).json({
                message: "Course deleted!"
            })
        } catch (err) {
            return res.status(404).send({
                err
            })
        }
    }
})

export { CourseRouter }