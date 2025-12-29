import { Webhook } from "svix";

import user from "../models/User";
// API controller to manage clerk User with database

const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await whook.varify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestap": req.headers["svix-timestap"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _d: data.id,
          email: data.email_address[0].email_address,
          name: data.first_name + " " + data,
          imageUrl : data.image_url,
        }
        await user.create(userData);
        res.json({});
        break;
      }

      case "user.updated": {
        const userData = {
          _d: data.id,
          email: data.email_address[0].email_address,
          name: data.first_name + " " + data,
          imageUrl : data.image_url,

        }
        await user.findByIdAndUpdate(data.id,userData)
        res.json({})
        break;
      }

      case 'user.daleted' : {
        await user.findByIdAndDelete(data.id)
        res.json({})
        break;
      }

      default :
      break;
    }
  } catch (error) {
    res.json({success : false, message : error.message})
  }
};
