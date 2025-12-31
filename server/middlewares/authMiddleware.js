// import { clerkClient } from "@clerk/express";

// //Middleware (Protect Educator Routes)

// export const protectEducator = async(req,res,next)=>{
//     try {
//         const userId = req.auth.userId
//         const response = await clerkClient.users.getUser(userId)

//         if(response.publicMetadata.role!=='educator'){
//             return res.json({success : false,message:'Unauthorized Access' })
//         }
//         next()
//     } catch (error) {
//         res.json({success:false,message:"jadu"})
//     }
// }



import { clerkClient } from "@clerk/express";

//Middleware (Protect Educator Routes)

export const protectEducator = async (req, res, next) => {
    try {
        const { userId } = req.auth(); // Changed: Call as function

        if (!userId) {
            return res.json({ success: false, message: 'Unauthorized Access - No user ID' });
        }

        const response = await clerkClient.users.getUser(userId);

        if (response.publicMetadata.role !== 'educator') {
            return res.json({ success: false, message: 'Unauthorized Access' });
        }

        next();
    } catch (error) {
        console.error('Educator protection error:', error); // Better error logging
        res.json({ success: false, message: "Authentication failed" });
    }
}