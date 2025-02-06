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
async function NewSearchIndex() {
    const client = new MongoClient(process.env.GEN_MONGO_URL);
    try {
        const database = client.db("Demonstrations");
        const collection = database.collection("Data");
        // define your Atlas Search index
        const index = {
            name: "Data",
            type: "vectorSearch",
            definition: {
                "fields": [
                    {
                        "type": "vector",
                        "numDimensions": 1536,
                        "path": "embeddingVector",
                        "similarity": "cosine",
                        "quantization": "scalar"
                    },
                    {
                        "type": "filter",
                        "path": "metadata.institutionName",
                    }
                ]
            }
        }
        let result = await collection.listSearchIndexes().toArray();
        let indexExists = result.some(idx => idx.name === "Data");
        if (!indexExists) {
            console.log("Creating new search index...");
            result = await collection.createSearchIndex(index);
            console.log(`New search index named '${result}' is building.`);

            // Wait for index to become queryable
            console.log("Polling to check if the index is ready. This may take up to a minute.");
            let isQueryable = false;
            while (!isQueryable) {
                const indexes = await collection.listSearchIndexes().toArray();
                const dataIndex = indexes.find(idx => idx.name === "Data");
                if (dataIndex?.queryable) {
                    console.log(`Index '${result}' is ready for querying.`);
                    isQueryable = true;
                } else {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        } else {
            console.log("Search index already exists, updating...");
            await collection.updateSearchIndex("Data", index);
        }


    } finally {
        await client.close();
        return { status: "success", message: "Vector index created" };
    }
}
export const Initiator = async (url, source, institutionName) => {
    try {
        let databaseConnectionStr = process.env.GEN_MONGO_URL
        const response = await fetch("http://localhost:3001/process", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url, source, databaseConnectionStr, institutionName })
        });
        const result = await response.json();
        console.log(result);
        await insertEmbeddings()
        await NewSearchIndex()
        return { success: true, message: "initiation successFull" }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};
