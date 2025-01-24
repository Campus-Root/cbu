import express from 'express'
import { getContext, getContextFromFullSite, getResponse, openai } from './utils/helper.js';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from "cors"
import path from 'path';
import { fileURLToPath } from "url";
import "dotenv/config"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()
const port = 3000
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("tiny"))
app.use(express.json({ type: ["application/json", "text/plain"], limit: '50mb' }));
app.use("/widget", express.static(path.join(__dirname, "public"), {
    extensions: ['html']
}));
app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.post('/v1/chat-bot', async (req, res) => {
    const { userMessage } = req.body;
    const contexts = await getContext(userMessage)
    try {
        const response = await getResponse(contexts, userMessage);
        const botMessage = response.choices[0].message.content;
        res.status(200).send({ success: true, data: botMessage })
    } catch (error) {
        console.error("Error with chatbot API:", error);
    }
})
app.post('/v2/chat-bot', async (req, res) => {
    const { userMessage, prevMessages = [] } = req.body;
    const contexts = await getContextFromFullSite(userMessage)
    try {
        const response = await getResponse(contexts, userMessage, prevMessages);
        const botMessage = response.choices[0].message.content;
        res.status(200).send({ success: true, data: botMessage })
    } catch (error) {
        console.error("Error with chatbot API:", error);
    }
})
app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})
app.post('/v3/chat-bot', async (req, res) => {
    try {
        const { userMessage, prevMessages = [] } = req.body;
        if (!userMessage) return res.status(400).send({ success: false, data: { "userMessage": userMessage } })
        const contexts = await getContextFromFullSite(userMessage)
        let messages = [{
            "role": "system",
            "content": "You are a helpful chatbot designed to provide accurate, concise, and personalized assist users with information about Christian Brothers University (CBU).Your responses are based exclusively on information from the institution's RAG (Retrieval-Augmented Generation) database.  When answering, ensure the information is directly relevant to the user's query and aligned with CBU. Do not answer questions unrelated to CBU. Answer in same language as user.",
        }, ...prevMessages]
        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [ ...messages,
            {
                role: "user",
                content: `Here is some information that exists in the database which might help you relate to the user's query: 
                            ${contexts}\n
                            Use this information to answer the following questions concisely:  "${userMessage}"`,
            },
            ],
            stream: true,
        });
        let botMessage = ""
        for await (const chunk of stream) {
            botMessage += chunk.choices[0]?.delta?.content
            res.write(JSON.stringify({ chunk: chunk.choices[0]?.delta?.content }) || "");
        }
        console.log("chunking done, sending all at once");
        res.status(200).send({ success: true, data: botMessage })
    } catch (error) {
        console.error("Error with chatbot API:", error);
    }
})

