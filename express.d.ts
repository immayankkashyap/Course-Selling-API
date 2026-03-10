import { Role } from "@prisma/client"
declare global {
    namespace Express {
        interface Request {
            role?: Role;
            userId?: string;
        }
    }
}