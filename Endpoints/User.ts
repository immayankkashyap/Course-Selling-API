import { Router } from "express";
import { authMiddleware } from '../middlewares/auth.ts'
import * as jwt from 'jsonwebtoken'
import type { Request, Response } from "express";
import * as bcrypt from 'bcrypt'
import { signupSchema, signinSchema } from '../schema.ts'
import * as z from 'zod'
import { prisma } from '../db.ts'
import { config } from 'dotenv'

config();

const userRouter = Router();

userRouter.post('/auth/signup', async (req: Request, res: Response) => {
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send({ error: "Zod validation failed." });
  }

  const userData = result.data;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).send({ error: "JWT secret not configured." });
  }

  try {
    const hashpassword = await bcrypt.hash(userData.password, 10);

    const createdUser = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashpassword,
        name: userData.name,
        role: userData.role as 'STUDENT' | 'INSTRUCTOR',
      },
    });

    const token = jwt.sign(
      { userId: createdUser.id, role: createdUser.role },
      secret
    );

    return res.status(201).send({ token });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).send({ error: "Email already exists." });
    }
    return res.status(500).send({ error: "Unable to add the entry to database." });
  }
});
// ...existing code...

userRouter.post('/auth/login',async (req:Request, res:Response) => {
    const result = signinSchema.safeParse(req.body);

    if(result.success){
        const userData: {
            email: string,
            password: string
        } = result.data

        const currentUser = await prisma.user.findUnique({
            where : {email:userData.email}
        })
        if(currentUser){
          bcrypt.compare(userData.password,currentUser.password,(err,result)=>{
                if(result){
                    const Token = jwt.sign({
                        userId:currentUser.id,
                        role:currentUser.role,
                    }, process.env.JWT_SECRET as jwt.Secret)
                    res.status(200).send({
                        token:Token
                    })
                } else {
                    res.status(401).send({
                        err:"User unauthorized!"
                    })
                }
            })
        } else {
            res.status(404).send({
                err:"User not found!"
            })
        }
    } else{
        res.status(400).send({
            err:"Zod validation failed."
        })
    }
})

export {userRouter}