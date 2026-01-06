const mongoose = require('mongoose');
const VocabularyBlock = require('./src/models/subModel/VocabularyBlock.schema');
const CardDeck = require('./src/models/CardDeck');

const MONGODB_URI = 'mongodb+srv://dinhnguyenminhhoang28_db_user:VJPDqSQvDyy4itff@elearing.wrocmb3.mongodb.net/E_Learing?retryWrites=true&w=majority&appName=eLearing';

mongoose.connect(MONGODB_URI).then(async () => {
    const blockId = '695c4ab1bc54052466a1584c';

    // Find a valid CardDeck
    const deck = await CardDeck.findOne({ title: /Daily Routines/ });
    if (!deck) {
        console.log('❌ No Daily Routines deck found');
        await mongoose.disconnect();
        process.exit(1);
    }

    console.log('🔧 Using CardDeck:', deck.title, deck._id.toString());
    console.log('\n📝 Updating vocabulary block...\n');

    try {
        const updated = await VocabularyBlock.findByIdAndUpdate(
            blockId,
            { cardDeck: deck._id },
            { new: true, runValidators: true }
        );

        if (updated) {
            console.log('✅ Update successful!');
            console.log('  Block ID:', updated._id.toString());
            console.log('  Type:', updated.type);
            console.log('  Title:', updated.title);
            console.log('  CardDeck ID:', updated.cardDeck ? updated.cardDeck.toString() : 'undefined');
        } else {
            console.log('❌ Block not found');
        }
    } catch (error) {
        console.log('❌ Update failed:', error.message);
    }

    await mongoose.disconnect();
    process.exit(0);
}).catch(e => {
    console.error('Connection error:', e);
    process.exit(1);
});
