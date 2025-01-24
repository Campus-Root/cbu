import { MongoClient } from "mongodb";
import OpenAI from "openai";
import "dotenv/config"
export const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY });
export const EmbeddingFunct = async (text) => {
    try {
        const { data } = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
            encoding_format: "float",
        });
        return data[0].embedding;
    } catch (error) {
        console.log(error);
        return null;
    }
}
export const getContextFromFullSite = async (userMessage) => {
    const url = process.env.MONGO_URL;
    const dbName = 'CBU';
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    try {
        let context = await db.collection('fullSite').aggregate([
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embeddingVector",
                    "queryVector": await EmbeddingFunct(userMessage),
                    "numCandidates": 100,
                    "limit": 3
                }
            },
            {
                $project: {
                    content: 1,
                    summary: 1,
                }
            }
        ]).toArray()
        client.close();
        return context.reduce((acc, ele) => acc += `\n${ele.content}\n`, "");
    } catch (error) {
        client.close();
        console.log(error);
        return null;
    }
}
export const getResponse = async (contexts, userMessage, prevMessages = []) => {
    try {
        if (contexts == "") console.log("Empty context received")
        let messages = [{
            "role": "system",
            "content": "You are a knowledgeable assistant designed to provide accurate, concise, and personalized information about Christian Brothers University (CBU). Your responses are based exclusively on verified information from the institution's RAG (Retrieval-Augmented Generation) database. When answering, ensure the information is directly relevant to the user's query and aligned with CBU's offerings, services, or institutional knowledge.  Do not answer questions that are  unrelated to university.Answer in same language as user.",
        }, ...prevMessages]
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [...messages, {
                role: "user",
                content: `For this query, the system has retrieved the following relevant information from CBU's database: 
                    ${contexts}\n
                    Using this institutional data, provide a tailored and precise response to the following user query: 
                    "${userMessage}"`
            }],
        });
        return response
    } catch (error) {
        console.log(error);
        return null;
    }
}