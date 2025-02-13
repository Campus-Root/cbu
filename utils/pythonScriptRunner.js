import { MongoClient } from "mongodb";
import { EmbeddingFunct } from './openAi.js';
const insertEmbeddings = async () => {
    const url = process.env.GEN_MONGO_URL;
    const client = await MongoClient.connect(url);
    try {
        const db = client.db("Demonstrations");
        const collection = db.collection("Data");
        const totalDocs = await collection.countDocuments({ embeddingVector: { $exists: false } });
        if (totalDocs === 0) {
            console.log("No documents need processing.");
            return null;
        }
        const numParts = 10;
        const batchSize = Math.ceil(totalDocs / numParts); // 10 parts
        console.log(`Total Documents: ${totalDocs}`);
        console.log(`Processing in ${numParts} parts with batch size: ${batchSize}`);
        let processedCount = 0;
        for (let i = 0; i < numParts; i++) {
            const docs = await collection.find(
                { embeddingVector: { $exists: false } },
                { projection: { content: 1 } }
            )
                .limit(batchSize) // Fetch only the batch size
                .toArray();
            if (docs.length === 0) break; // Stop when no more docs
            // Generate embeddings in parallel
            const updates = await Promise.all(
                docs.map(async (doc) => ({
                    updateOne: {
                        filter: { _id: doc._id },
                        update: { $set: { embeddingVector: await EmbeddingFunct(doc.content) } }
                    }
                }))
            );
            // Perform bulk update
            if (updates.length > 0) {
                await collection.bulkWrite(updates);
                processedCount += docs.length;
                console.log(`Processed ${processedCount} / ${totalDocs} documents.`);
            }
        }

        return { status: "success", message: "Embeddings Completed" };

    }
    catch (error) {
        console.log(error);
    }
}
export const Crawler = async (urls, source, institutionName) => {
    try {
        let databaseConnectionStr = process.env.GEN_MONGO_URL, collectionName = "NewProcessTest", dbName = "Data"
        const response = await fetch("http://localhost:3001/crawl-urls", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Connection": "keep-alive"
            },
            body: JSON.stringify({ urls, collectionName, dbName, source, databaseConnectionStr, institutionName })
        });
        const result = await response.json();
        // await insertEmbeddings()
        // await NewSearchIndex()
        return { success: true, message: "initiation successFull", data: result }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return { success: false, message: error.message }
    }
};
