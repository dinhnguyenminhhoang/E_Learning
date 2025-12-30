const WritingTemplate = require("../WritingTemplate");

// Helper function to generate templates
const generateTemplates = () => {
    const templates = [];

    // EASY LEVEL - Essays (20 templates)
    const easyEssayTopics = [
        { title: "My Favorite Hobby", titleVi: "Sở thích yêu thích của tôi", prompt: "Write about your favorite hobby. Explain what it is, why you enjoy it, and how often you do it.", category: "Lifestyle" },
        { title: "My Best Friend", titleVi: "Người bạn thân nhất của tôi", prompt: "Describe your best friend. What makes them special?", category: "Relationships" },
        { title: "My Family", titleVi: "Gia đình tôi", prompt: "Write about your family. Who are the members and what do you like to do together?", category: "Family" },
        { title: "My Favorite Food", titleVi: "Món ăn yêu thích", prompt: "Describe your favorite food. Why do you like it?", category: "Food" },
        { title: "My Daily Routine", titleVi: "Thói quen hàng ngày", prompt: "Describe a typical day in your life from morning to evening.", category: "Daily Life" },
        { title: "My Favorite Season", titleVi: "Mùa yêu thích", prompt: "Which season do you like best and why?", category: "Nature" },
        { title: "My Dream Job", titleVi: "Công việc mơ ước", prompt: "What job would you like to have in the future? Why?", category: "Career" },
        { title: "My Favorite Sport", titleVi: "Môn thể thao yêu thích", prompt: "Write about your favorite sport. Do you play it or watch it?", category: "Sports" },
        { title: "My Favorite Book", titleVi: "Cuốn sách yêu thích", prompt: "Describe a book you really enjoyed reading.", category: "Literature" },
        { title: "My Favorite Movie", titleVi: "Bộ phim yêu thích", prompt: "Write about a movie you love. What is it about?", category: "Entertainment" },
        { title: "My Pet", titleVi: "Thú cưng của tôi", prompt: "If you have a pet, describe it. If not, what pet would you like to have?", category: "Animals" },
        { title: "My Hometown", titleVi: "Quê hương tôi", prompt: "Describe the place where you grew up.", category: "Places" },
        { title: "My Favorite Teacher", titleVi: "Giáo viên yêu thích", prompt: "Write about a teacher who influenced you.", category: "Education" },
        { title: "A Happy Memory", titleVi: "Kỷ niệm vui", prompt: "Describe a happy memory from your childhood.", category: "Memories" },
        { title: "My Bedroom", titleVi: "Phòng ngủ của tôi", prompt: "Describe your bedroom and your favorite things in it.", category: "Home" },
        { title: "My Favorite Music", titleVi: "Âm nhạc yêu thích", prompt: "What kind of music do you like? Why?", category: "Music" },
        { title: "A Weekend Activity", titleVi: "Hoạt động cuối tuần", prompt: "What do you usually do on weekends?", category: "Leisure" },
        { title: "My School", titleVi: "Trường học của tôi", prompt: "Describe your school and what you like about it.", category: "Education" },
        { title: "My Favorite Color", titleVi: "Màu sắc yêu thích", prompt: "What is your favorite color and why do you like it?", category: "Personal" },
        { title: "Learning English", titleVi: "Học tiếng Anh", prompt: "Why are you learning English? What do you find difficult?", category: "Language" }
    ];

    easyEssayTopics.forEach((topic, index) => {
        templates.push({
            title: topic.title,
            titleVi: topic.titleVi,
            prompt: topic.prompt,
            promptVi: "",
            level: "easy",
            type: "essay",
            category: topic.category,
            minWords: 100,
            maxWords: 200,
            hints: ["Start with an introduction", "Give specific examples", "Explain your feelings or opinions"],
            order: index + 1
        });
    });

    // EASY LEVEL - Emails (10 templates)
    const easyEmailTopics = [
        { title: "Email to a Friend", prompt: "Write an email to your friend about your weekend plans." },
        { title: "Thank You Email", prompt: "Write an email thanking someone for a gift." },
        { title: "Invitation Email", prompt: "Invite your friend to your birthday party." },
        { title: "Asking for Help", prompt: "Write an email asking a classmate to help you with homework." },
        { title: "Apology Email", prompt: "Apologize to a friend for missing their event." },
        { title: "Travel Plans", prompt: "Tell your friend about your upcoming vacation." },
        { title: "Book Recommendation", prompt: "Recommend a good book to your friend." },
        { title: "Movie Invitation", prompt: "Invite your friend to watch a movie together." },
        { title: "Study Group", prompt: "Invite classmates to form a study group." },
        { title: "Congratulations", prompt: "Congratulate a friend on their achievement." }
    ];

    easyEmailTopics.forEach((topic, index) => {
        templates.push({
            title: topic.title,
            titleVi: "",
            prompt: topic.prompt,
            promptVi: "",
            level: "easy",
            type: "email",
            category: "Communication",
            minWords: 80,
            maxWords: 150,
            hints: ["Use a friendly greeting", "Be clear about your message", "End with a warm closing"],
            order: 20 + index + 1
        });
    });

    // MEDIUM LEVEL - Essays (20 templates)
    const mediumEssayTopics = [
        { title: "The Importance of Learning English", prompt: "Discuss why learning English is important in today's world.", category: "Education" },
        { title: "Technology and Modern Life", prompt: "How has technology changed our daily lives? Discuss both positive and negative aspects.", category: "Technology" },
        { title: "Environmental Protection", prompt: "What can individuals do to protect the environment?", category: "Environment" },
        { title: "Social Media Impact", prompt: "How does social media affect our relationships?", category: "Social Issues" },
        { title: "Healthy Lifestyle", prompt: "What does it mean to live a healthy lifestyle?", category: "Health" },
        { title: "Education System", prompt: "What changes would improve the education system?", category: "Education" },
        { title: "Online Shopping", prompt: "Compare online shopping with traditional shopping.", category: "Lifestyle" },
        { title: "Work-Life Balance", prompt: "Why is work-life balance important?", category: "Career" },
        { title: "Public Transportation", prompt: "Discuss the advantages of using public transportation.", category: "Transport" },
        { title: "Traditional vs Modern", prompt: "Should we preserve traditional customs in modern society?", category: "Culture" },
        { title: "Television Influence", prompt: "How does television influence society?", category: "Media" },
        { title: "Sports Benefits", prompt: "What are the benefits of playing sports?", category: "Sports" },
        { title: "City vs Countryside", prompt: "Would you prefer to live in a city or the countryside? Why?", category: "Lifestyle" },
        { title: "Reading Habits", prompt: "Why is reading important? How can we encourage it?", category: "Literature" },
        { title: "Time Management", prompt: "How can students manage their time effectively?", category: "Skills" },
        { title: "Fast Food Culture", prompt: "Discuss the effects of fast food on society.", category: "Food" },
        { title: "Tourism Impact", prompt: "What are the positive and negative impacts of tourism?", category: "Travel" },
        { title: "Teamwork", prompt: "Why is teamwork important in the workplace?", category: "Career" },
        { title: "Mobile Phones", prompt: "How have mobile phones changed communication?", category: "Technology" },
        { title: "Learning Languages", prompt: "What are the benefits of being bilingual?", category: "Language" }
    ];

    mediumEssayTopics.forEach((topic, index) => {
        templates.push({
            title: topic.title,
            titleVi: "",
            prompt: topic.prompt,
            promptVi: "",
            level: "medium",
            type: "essay",
            category: topic.category,
            minWords: 150,
            maxWords: 250,
            hints: ["Present clear arguments", "Use examples to support your points", "Consider different perspectives"],
            order: 30 + index + 1
        });
    });

    // MEDIUM LEVEL - Emails & Stories (10 templates)
    const mediumMixedTopics = [
        { title: "Job Application Email", type: "email", prompt: "Write a formal email applying for a part-time job.", minWords: 100, maxWords: 180 },
        { title: "Complaint Letter", type: "email", prompt: "Write a formal email complaining about a product or service.", minWords: 100, maxWords: 180 },
        { title: "An Unexpected Adventure", type: "story", prompt: "Write about an unexpected adventure you had.", minWords: 150, maxWords: 250 },
        { title: "A Difficult Decision", type: "story", prompt: "Describe a time when you had to make a difficult decision.", minWords: 150, maxWords: 250 },
        { title: "Meeting Someone Famous", type: "story", prompt: "Imagine you met someone famous. Write about the experience.", minWords: 150, maxWords: 250 },
        { title: "Request for Information", type: "email", prompt: "Write to a company requesting information about their products.", minWords: 100, maxWords: 180 },
        { title: "A Learning Experience", type: "story", prompt: "Write about a time when you learned something important.", minWords: 150, maxWords: 250 },
        { title: "Booking Confirmation", type: "email", prompt: "Write an email to confirm a hotel booking.", minWords: 100, maxWords: 180 },
        { title: "The Lost Item", type: "story", prompt: "Write a story about finding or losing something important.", minWords: 150, maxWords: 250 },
        { title: "Customer Feedback", type: "email", prompt: "Write feedback to a restaurant or shop.", minWords: 100, maxWords: 180 }
    ];

    mediumMixedTopics.forEach((topic, index) => {
        templates.push({
            title: topic.title,
            titleVi: "",
            prompt: topic.prompt,
            promptVi: "",
            level: "medium",
            type: topic.type,
            category: topic.type === "email" ? "Business" : "Adventure",
            minWords: topic.minWords,
            maxWords: topic.maxWords,
            hints: topic.type === "email"
                ? ["Use formal language", "Be clear and concise", "Include all necessary information"]
                : ["Set the scene", "Build tension or interest", "Show your emotions"],
            order: 50 + index + 1
        });
    });

    // HARD LEVEL - Essays & Opinion Pieces (30 templates)
    const hardTopics = [
        { title: "Climate Change Solutions", type: "essay", prompt: "Analyze the causes of climate change and propose comprehensive solutions.", category: "Environment" },
        { title: "Artificial Intelligence Ethics", type: "opinion", prompt: "Discuss the ethical implications of artificial intelligence in society.", category: "Technology" },
        { title: "Global Education Crisis", type: "essay", prompt: "Examine the challenges facing global education and suggest reforms.", category: "Education" },
        { title: "Social Media Regulation", type: "opinion", prompt: "Should social media platforms be regulated? Present your argument.", category: "Social Issues" },
        { title: "Universal Basic Income", type: "opinion", prompt: "Analyze the concept of universal basic income. Is it feasible?", category: "Economics" },
        { title: "Renewable Energy Future", type: "essay", prompt: "Evaluate the potential of renewable energy to replace fossil fuels.", category: "Environment" },
        { title: "Privacy in Digital Age", type: "opinion", prompt: "How can we balance privacy and security in the digital age?", category: "Technology" },
        { title: "Healthcare Access", type: "essay", prompt: "Should healthcare be free for everyone? Discuss the implications.", category: "Social Issues" },
        { title: "Space Exploration Value", type: "opinion", prompt: "Is space exploration worth the investment? Argue your position.", category: "Science" },
        { title: "Genetic Engineering", type: "essay", prompt: "Discuss the ethical and practical implications of genetic engineering.", category: "Science" },
        { title: "Globalization Impact", type: "essay", prompt: "Analyze the effects of globalization on developing countries.", category: "Economics" },
        { title: "Automation and Jobs", type: "opinion", prompt: "How will automation affect the future of work?", category: "Technology" },
        { title: "Mental Health Awareness", type: "essay", prompt: "Why is mental health awareness crucial in modern society?", category: "Health" },
        { title: "Income Inequality", type: "opinion", prompt: "What are the main causes of income inequality and how can it be addressed?", category: "Economics" },
        { title: "Online Education Future", type: "essay", prompt: "Will online education replace traditional classrooms?", category: "Education" },
        { title: "Cultural Preservation", type: "opinion", prompt: "How important is it to preserve indigenous cultures?", category: "Culture" },
        { title: "Sustainable Development", type: "essay", prompt: "What does sustainable development mean for future generations?", category: "Environment" },
        { title: "Democracy Challenges", type: "opinion", prompt: "What are the biggest challenges facing democracy today?", category: "Politics" },
        { title: "Scientific Literacy", type: "essay", prompt: "Why is scientific literacy important for citizens?", category: "Education" },
        { title: "Urban Planning", type: "opinion", prompt: "How should cities be designed for the 21st century?", category: "Society" },
        { title: "Digital Divide", type: "essay", prompt: "Analyze the digital divide and its impact on society.", category: "Technology" },
        { title: "Animal Rights", type: "opinion", prompt: "Should animals have legal rights? Defend your position.", category: "Ethics" },
        { title: "Media Influence", type: "essay", prompt: "How does media shape public opinion?", category: "Media" },
        { title: "Immigration Policy", type: "opinion", prompt: "What should be the principles of fair immigration policy?", category: "Politics" },
        { title: "Consumer Culture", type: "essay", prompt: "Analyze the effects of consumer culture on society.", category: "Society" },
        { title: "Cybersecurity", type: "opinion", prompt: "What are the most pressing cybersecurity challenges?", category: "Technology" },
        { title: "Alternative Medicine", type: "essay", prompt: "Should alternative medicine be integrated with conventional healthcare?", category: "Health" },
        { title: "Youth Activism", type: "opinion", prompt: "What role should young people play in social change?", category: "Social Issues" },
        { title: "Artificial Meat", type: "essay", prompt: "Could lab-grown meat solve environmental and ethical issues?", category: "Science" },
        { title: "Digital Citizenship", type: "opinion", prompt: "What does it mean to be a responsible digital citizen?", category: "Technology" }
    ];

    hardTopics.forEach((topic, index) => {
        templates.push({
            title: topic.title,
            titleVi: "",
            prompt: topic.prompt,
            promptVi: "",
            level: "hard",
            type: topic.type,
            category: topic.category,
            minWords: 250,
            maxWords: 400,
            hints: [
                "Develop a clear thesis statement",
                "Support arguments with evidence and examples",
                "Consider counterarguments",
                "Draw well-reasoned conclusions"
            ],
            order: 60 + index + 1
        });
    });

    // HARD LEVEL - Stories & Descriptions (10 templates)
    const hardCreativeTopics = [
        { title: "A Life-Changing Experience", type: "story", prompt: "Write about an experience that fundamentally changed your perspective on life." },
        { title: "Future World Description", type: "description", prompt: "Describe what you think the world will look like in 50 years." },
        { title: "Overcoming Fear", type: "story", prompt: "Tell the story of overcoming a significant fear or challenge." },
        { title: "Historical Event Witness", type: "story", prompt: "Imagine you witnessed an important historical event. Describe it." },
        { title: "Ideal Society", type: "description", prompt: "Describe your vision of an ideal society." },
        { title: "Cultural Journey", type: "story", prompt: "Write about an experience that deepened your understanding of another culture." },
        { title: "Innovation Impact", type: "description", prompt: "Describe an innovation that could solve a major world problem." },
        { title: "Moral Dilemma", type: "story", prompt: "Write about facing a difficult moral dilemma and how you resolved it." },
        { title: "Future Career Path", type: "description", prompt: "Describe your ideal career path and the impact you want to make." },
        { title: "Turning Point", type: "story", prompt: "Write about a turning point in your personal development." }
    ];

    hardCreativeTopics.forEach((topic, index) => {
        templates.push({
            title: topic.title,
            titleVi: "",
            prompt: topic.prompt,
            promptVi: "",
            level: "hard",
            type: topic.type,
            category: topic.type === "story" ? "Personal Growth" : "Vision",
            minWords: 250,
            maxWords: 400,
            hints: [
                "Use vivid, descriptive language",
                "Create a compelling narrative structure",
                "Show character development or deeper meaning",
                "Engage the reader emotionally"
            ],
            order: 90 + index + 1
        });
    });

    return templates;
};

const sampleTemplates = generateTemplates();

async function seedWritingTemplates() {
    try {
        const existingCount = await WritingTemplate.countDocuments({});

        if (existingCount > 0) {
            console.log(`Found ${existingCount} existing writing templates. Skipping seed.`);
            return [];
        }

        const result = await WritingTemplate.insertMany(sampleTemplates);
        console.log(`Successfully seeded ${result.length} writing templates`);

        return result;
    } catch (error) {
        console.error("Error seeding writing templates:", error);
        throw error;
    }
}

module.exports = { seedWritingTemplates, sampleTemplates };
