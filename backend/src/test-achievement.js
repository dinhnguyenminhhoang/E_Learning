const mongoose = require('mongoose');
const User = require('./models/User');
const AchievementService = require('./services/achievement.service');

async function testAchievement() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://hoangdev:hoangdev123@e-learningdev.jjduo.mongodb.net/e_learning_dev?retryWrites=true&w=majority&appName=e-learningdev');

        const userId = '68d6b94dcbcf0248cdca3d99'; // Your user ID

        const user = await User.findById(userId);
        console.log('\n=== USER STATS ===');
        console.log('currentLoginStreak:', user.statistics.currentLoginStreak);
        console.log('lastLoginDate:', user.statistics.lastLoginDate);
        console.log('currentStreak:', user.statistics.currentStreak);
        console.log('lastStudyDate:', user.statistics.lastStudyDate);

        console.log('\n=== CALLING checkAndUnlockAchievements ===');
        const unlockedAchievements = await AchievementService.checkAndUnlockAchievements(
            userId,
            user.statistics
        );

        console.log('\n=== UNLOCKED ACHIEVEMENTS ===');
        console.log(JSON.stringify(unlockedAchievements, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testAchievement();
