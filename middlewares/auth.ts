import * as jwt from 'jsonwebtoken'
import type { Response, Request, NextFunction } from 'express'
import { config } from 'dotenv'
import strict from 'node:assert/strict';
import { string } from 'zod';
config();

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'no token found' })
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret) as {
            userId:string,
            role: "Student" | "Instructor"
        };

        req.userId = payload.userId;
        req.role = payload.role;

        return next();

    } catch (err) {
        return res.status(403).send({
            err
        })
    }
}

export { authMiddleware }