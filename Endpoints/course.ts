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

CourseRouter.post('/courses', authMiddleware, async (req: Request, res: Response) => {
    const result = createCourseSchema.safeParse(req.body)
    if (req.role != 'Instructor') {
        res.status(403).send({
            err: "Unauthorized access"
        })
    } else if (!result.success) {
        console.log("Invalid inout")
        res.status(403).send({
            err: "Invalid input!"
        })
    } else {
        const courseInfo: {
            instructorId: string,
            title: string,
            price: number,
            description: string
        } = {
            instructorId: req.userId!,
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
            return res.status(400).send({
                err,
            })
        }
    }

})

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

CourseRouter.get('/courses/:id', async (req: Request, res: Response) => {
    const courseId = req.params.id;
    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId as string },
            include: {
                lessons: true
            }
        })
        if (!course) {
            return res.status(404).send({
                message: "Course not found!"
            })
        } else {
            return res.status(200).send({
                course,
            })
        }
    } catch (err) {
        return res.status(401).send({
            err,
        })
    }
})

CourseRouter.patch('/courses/:id', async (req: Request, res: Response) => {
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

CourseRouter.delete('/courses/:id', async (req: Request, res: Response) => {
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