import express from 'express'
import type { Express } from 'express'
import { userRouter } from './Endpoints/User'
import { CourseRouter } from './Endpoints/course'

const app: Express = express();

app.use(express.json());
app.use('/', userRouter);
app.use('/', CourseRouter);

app.listen(3000, () => {
    console.log("Server is live")
})

