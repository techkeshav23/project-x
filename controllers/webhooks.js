import { Webhook } from "svix";
import User from "../models/User.js";
import connectDB from "../config/db.js";

// API Controller Function to Manage Clerk User with database
export const clerkWebhooks = async (req, res) => {
    try {
        // Ensure database connection is established before any operations
        await connectDB();

        // Create a Svix instance with clerk webhook secret.
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        // Verifying Headers
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        })

        // Getting Data from request body
        const { data, type } = req.body

        // Switch Cases for differernt Events
        switch (type) {
            case 'user.created': {
                console.log("📌 User Created Event Data:", data);

                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    image: data.image_url,
                    resume: ''
                }
                console.log("✅ Parsed User Data to Save:", userData);
                
                const newUser = await User.create(userData)
                console.log("🎉 User successfully created in database:", newUser._id);
                res.json({ success: true, message: 'User created successfully' })
                break;
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    image: data.image_url,
                }
                console.log("✅ Parsed User Data for Update:", userData);
                
                const updatedUser = await User.findByIdAndUpdate(data.id, userData, { new: true })
                console.log("🔄 User successfully updated in database:", updatedUser?._id);
                res.json({ success: true, message: 'User updated successfully' })
                break;
            }

            case 'user.deleted': {
                console.log("📌 User Deleted Event ID:", data.id);
                const deletedUser = await User.findByIdAndDelete(data.id)
                console.log("🗑️ User successfully deleted from database:", deletedUser?._id);
                res.json({ success: true, message: 'User deleted successfully' })
                break;
            }
            default:
                break;
        }

    } catch (error) {
        console.error("❌ Webhook Error:", error.message);
        console.error("❌ Webhook Error Stack:", error.stack);
        res.status(400).json({ success: false, message: error.message })
    }
}