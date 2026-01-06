/**
 * MASTER SEED FILE - ALL 10 TOPICS COMBINED
 * Run: node src/scripts/seedComprehensive.js
 */

const { STATUS } = require("../../constants/status.constans");

// Import topics - using try-catch to handle missing files gracefully
let topic1_dailyLife, topic2_business, topic3_travel;
let topic4_health, topic5_technology, topic6_education, topic7_food;
let topic8_sports, topic9_environment, topic10_entertainment;

try {
    const allTopics = require("./allTopics.seed");
    topic1_dailyLife = allTopics.topic1;
    topic2_business = allTopics.topic2;
    topic3_travel = allTopics.topic3;
} catch (e) {
    console.error("Error loading allTopics:", e.message);
}

try {
    const additionalTopics = require("./additionalTopics.seed");
    topic4_health = additionalTopics.topic4_health;
    topic5_technology = additionalTopics.topic5_technology;
    topic6_education = additionalTopics.topic6_education;
    topic7_food = additionalTopics.topic7_food;
} catch (e) {
    console.error("Error loading additionalTopics:", e.message);
}

try {
    const finalTopics = require("./finalTopics.seed");
    topic8_sports = finalTopics.topic8_sports;
    topic9_environment = finalTopics.topic9_environment;
    topic10_entertainment = finalTopics.topic10_entertainment;
} catch (e) {
    console.error("Error loading finalTopics:", e.message);
}

// Combine all topics (filter out undefined)
const comprehensiveSeedData = [
    topic1_dailyLife,
    topic2_business,
    topic3_travel,
    topic4_health,
    topic5_technology,
    topic6_education,
    topic7_food,
    topic8_sports,
    topic9_environment,
    topic10_entertainment
].filter(Boolean);

// Export
module.exports = {
    comprehensiveSeedData,
    // Individual exports for testing
    topic1_dailyLife,
    topic2_business,
    topic3_travel,
    topic4_health,
    topic5_technology,
    topic6_education,
    topic7_food,
    topic8_sports,
    topic9_environment,
    topic10_entertainment
};
