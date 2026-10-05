import app from "./src/app.js";
import connectDB from "./src/config/database.js";

const PORT = 3000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
    console.log(`Auth server is running on http://localhost:${PORT}`);
});

