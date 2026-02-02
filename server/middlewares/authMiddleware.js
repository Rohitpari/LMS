import { clerkClient } from "@clerk/express";

// Protect Educator Routes
export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    // const auth = req.auth();
    // const userId = auth.userId;
    // console.log("protectEducator userId:", userId);
    


    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access - No user ID",
      });
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.publicMetadata.role!== "educator") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    next();
  } catch (error) {
    console.error("Educator protection error:", error);
    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

