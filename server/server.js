import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/mongodb.js';
import { Webhook } from 'svix';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './config/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoute.js';

// inttialize express

const app = express();

// cponnect to database
await connectDB();
await connectCloudinary();

//  middlewares 
app.use(cors())
app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks)

app.post('/clerk',express.raw({ type: "application/json" }), clerkWebhooks);



app.use(clerkMiddleware())
app.use(express.json())

//Routes
app.get('/',(req,res)=> res.send("API Working"))
app.use('/api/educator',express.json(),educatorRouter);
app.use('/api/course',express.json(),courseRouter)
app.use('/api/user',express.json(),userRouter)



// Port 
const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
}) 

