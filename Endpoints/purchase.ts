import { prisma } from "../db.ts";
import type {Request,Response} from "express"
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.ts";
import { purchaseCourseSchema } from "../schema";


const purchaseRouter = Router();

purchaseRouter.post('/purchase', authMiddleware,async (req:Request,res:Response) => {
    const result = purchaseCourseSchema.safeParse(req.body);
    if(!result.success){
        return res.status(400).send({
            msg:"Invalid data!"
        })
    } else if (req.role!='INSTRUCTOR'){
        return res.status(4)
    }
    else{
        try{

        }
    }
})