import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(req.body, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const payload = JSON.parse(req.body.toString());
    const { data, type } = payload;

    if (type === "user.created" || type === "user.updated") {
      await User.findByIdAndUpdate(
        data.id,
        {
          _id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email_addresses?.[0]?.email_address || "",
          imageUrl: data.image_url,
        },
        { upsert: true, new: true }
      );
    }

    if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).json({ success: false });
  }
};





// controllers/webhooks.js
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = Stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.log("Stripe verification failed");
        return res.status(400).send(`Webhook error : ${error.message}`);
    }

    // Switch case start
    switch (event.type) {
        // Ise handle karna sabse safe hai metadata ke liye
        case "checkout.session.completed": {
            const session = event.data.object;
            const { purchaseId } = session.metadata;

            try {
                const purchaseData = await Purchase.findById(purchaseId);
                if (purchaseData) {
                    const userData = await User.findById(purchaseData.userId);
                    const courseData = await Course.findById(purchaseData.courseId);

                    // Student Enrollment update
                    if (courseData && !courseData.enrolledStudents.includes(userData._id)) {
                        courseData.enrolledStudents.push(userData._id);
                        await courseData.save();
                    }

                    // User Enrollment update
                    if (userData && !userData.enrolledCourses.includes(courseData._id)) {
                        userData.enrolledCourses.push(courseData._id);
                        await userData.save();
                    }

                    // Purchase status update
                    purchaseData.status = "completed";
                    await purchaseData.save();
                    console.log("Database successfully updated!");
                }
            } catch (dbError) {
                console.error("DB Update Error:", dbError.message);
            }
            break;
        }

        case "payment_intent.succeeded": {
            // Agar aap payment_intent.succeeded handle karna chahte hain
            const paymentIntent = event.data.object;
            // stripeInstance use karein, Stripe nahi
            const sessions = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntent.id,
            });
            
            if (sessions.data.length > 0) {
                const { purchaseId } = sessions.data[0].metadata;
                await Purchase.findByIdAndUpdate(purchaseId, { status: "completed" });
            }
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};