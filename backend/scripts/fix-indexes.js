require('dotenv').config();
const mongoose = require('mongoose');

const connectString = process.env.MONGO_URI;

async function fixDuplicateIndexes() {
    try {
        if (!connectString) {
            throw new Error('MONGO_URI not found in .env file');
        }

        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(connectString);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;

        // Lấy tất cả collections
        const collections = await db.listCollections().toArray();

        for (const collection of collections) {
            const collectionName = collection.name;
            console.log(`\n🔍 Checking collection: ${collectionName}`);

            try {
                const indexes = await db.collection(collectionName).indexes();
                console.log('Current indexes:', indexes.map(i => i.name));

                // Xóa các index trùng lặp (không phải unique)
                for (const idx of indexes) {
                    // Chỉ xóa index nếu nó có duplicate warning
                    if (idx.name !== '_id_' &&
                        (idx.name.includes('updatedAt_1') ||
                            idx.name.includes('revokedAt_1') ||
                            idx.name.includes('isCompromised_1'))) {

                        // Kiểm tra xem có phải unique index không
                        if (!idx.unique) {
                            await db.collection(collectionName).dropIndex(idx.name);
                            console.log(`✅ Dropped index: ${idx.name}`);
                        }
                    }
                }
            } catch (err) {
                console.log(`⚠️  ${collectionName}: ${err.message}`);
            }
        }

        console.log('\n✅ Index cleanup completed!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixDuplicateIndexes();