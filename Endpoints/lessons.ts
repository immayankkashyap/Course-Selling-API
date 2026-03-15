import { response, Router } from "express";
import { createLessonSchema } from "../schema";
import * as jwt from 'jsonwebtoken'
import type { Request, Response } from "express";
import { authMiddleware } from "../middlewares/auth";
import { prisma } from "../db.ts";
import { tr } from "zod/locales";


const LessonRouter = Router();

LessonRouter.post('/lessons', authMiddleware, async (req: Request, res: Response) => {
    const result = createLessonSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).send({
            err: "Invalid input!"
        })
    // } else if (req.role != 'Instructor') {
    //     res.status(403).send({
    //         err: "Unauthorized access!"
    //     })
    } else {
        const lessonData: {
            title: string,
            content: string,
            courseId: string,
        } = {
            title: result.data.title,
            content: result.data.content,
            courseId: result.data.courseId,
        }

        try {
            const lesson = await prisma.lesson.create({
                data:lessonData,
            })
            return res.status(200).send({
                id: lesson.id,
                msg: `Successfully added`
            })

        } catch (err) {
            console.log(err)
            return res.status(404).send({
                err
            })
        }
    }
})

LessonRouter.get('/courses/:courseId/lessons',async (req:Request,res:Response) => {
    const {courseId} = req.params;
    try{
        const lessonData = await prisma.lesson.findUnique({
            where:{id:courseId as string},
            include:{
                // lessons:true,
            }
        });
        if (lessonData){
            return res.status(200).send({
                msg: `Lesson found!`
            })
        } else{
            return res.status(404).send({
                msg:"No lesson found!"
            })
        }

    } catch(err){
        res.status(401).send({
            err
        })
    }
})

export {LessonRouter}