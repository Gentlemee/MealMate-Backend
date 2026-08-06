import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
 
// Connect Database
connectDB();

// Start Server
app.listen(PORT, () => {
    console.log(`MealMate server running on port ${PORT}`);
}); 
