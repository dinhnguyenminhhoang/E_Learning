const mongoose = require("mongoose");
const { seedWritingTemplates } = require("../models/seeds/writingTemplate.seed");

// Load environment variables
require("dotenv").config();

async function main() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/elearning";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        // Run seed
        await seedWritingTemplates();

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
}

main();
