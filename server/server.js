import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import { Webhook } from 'svix';
import { clerkWebhooks } from './controllers/webhooks.js'

// inttialize express

const app = express();

// cponnect to database
await connectDB();

//  middlewares

app.use(cors())

//Routes

app.get('/',(req,res)=> res.send("API Working"))
app.post(
  '/clerk',express.json(), clerkWebhooks);

// Port 
const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
}) 