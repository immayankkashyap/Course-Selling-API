import { prisma } from "../db.ts";
import type {Request,Response} from "express"
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.ts";
import { purchaseCourseSchema } from "../schema";
import { create } from "node:domain";


const purchaseRouter = Router();

purchaseRouter.post('/purchase', authMiddleware,async (req:Request,res:Response) => {
    const result = purchaseCourseSchema.safeParse(req.body);
    if(!result.success){
        return res.status(400).send({
            msg:"Invalid data!"
        })
    } else if (req.role!='INSTRUCTOR'){
        return res.status(403).send({
            msg: "Unauthorized access!"
        })
    }
    else{
        if(!req.userId){

        }
        else{
        const purchaseInfo:{
            userId:string,
            courseId: string,
            createdAt: Date,
        } = {
            userId: req.userId,
            courseId: result.data.courseId,
            createdAt: new Date(),
        }
        
        try{
            const purchaseData = await prisma.purchase.create({
                data: purchaseInfo,
            })
            return res.status(200).send({
                msg: "Created successfully!"
            })
        } catch(err){
            return res.status(500).send({
                err,
            })
        }
    }
})