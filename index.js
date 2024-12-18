import express from 'express'
import { getContext, getContextV2, getResponse } from './utils/helper.js';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from "cors"
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()
const port = 3000
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
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
    const contexts = await getContextV2(userMessage)
    try {
        const response = await getResponse(contexts, userMessage, prevMessages);
        const botMessage = response.choices[0].message.content;
        res.status(200).send({ success: true, data: botMessage })
    } catch (error) {
        console.error("Error with chatbot API:", error);
    }
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})