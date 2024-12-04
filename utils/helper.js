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
export const getContext = async (userMessage) => {
    const url = process.env.MONGO_URL;
    const dbName = 'CBU';
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    try {

        let context = await db.collection('embeddings').aggregate([
            {
                $vectorSearch: {
                    "queryVector": await EmbeddingFunct(userMessage),
                    "path": "embedding",
                    "numCandidates": 100,
                    "limit": 5,
                    "index": "cbu_vector_index"
                }
            },
            { $project: { text: 1 } }
        ]).toArray()
        client.close();
        return context;

    } catch (error) {
        client.close();
        console.log(error);
        return null;
    }
}
export const getContextV2 = async (userMessage) => {
    const url = process.env.MONGO_URL;
    const dbName = 'CBU';
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    try {

        let context = await db.collection('test').aggregate([
            {
                $vectorSearch: {
                    "queryVector": await EmbeddingFunct(userMessage),
                    "path": "embedding",
                    "numCandidates": 100,
                    "limit": 5,
                    "index": "cbu_vector_index2"
                }
            },
            { $project: { text: 1 } }
        ]).toArray()
        client.close();
        return context;

    } catch (error) {
        client.close();
        console.log(error);
        return null;
    }
}
export const getResponse = async (contexts, userMessage, prevMessages = []) => {
    try {
        let messages = [{
            "role": "system",
            "content": "You are a helpful chatbot designed to assist users with information about Christian Brothers University (CBU). You only provide information related to the university and do not answer questions unrelated to CBU."
        }, ...prevMessages]
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [...messages, {
                role: "user",
                content: `Here is some information that exists in database which might help you relate to the user's query: 
                    ${contexts.map(context => context.text).join('\n')}\n
                    Use this information to answer the following questions concisely:  "${userMessage}"`
            }],
        });
        return response
    } catch (error) {
        console.log(error);
        return null;
    }
}