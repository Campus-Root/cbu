import express from 'express'
import { getContextFromFullSite, getResponse, openai } from './utils/helper.js';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from "cors"
import path from 'path';
import { fileURLToPath } from "url";
import "dotenv/config"
import { toolFunctions, tools } from './utils/tools.js';
import { MongoClient, ObjectId } from 'mongodb';
import { Initiator } from './utils/pythonScriptRunner.js';
import { getContext } from './utils/openAi.js';
import { attempt1, attempt2 } from './utils/misc.js';
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
app.get("/get-sublinks", async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'Missing url' });
        let subLinks = await attempt1(url)
        if (subLinks.length === 0) {
            console.log("No subLinks found on attempt1")
            subLinks = await attempt2(url)
        }
        res.json({ success: true, data: subLinks, metaData: { size: subLinks.length } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
})
app.post('/process-urls', async (req, res) => {
    try {

        const { urls, source, businessName, systemPrompt, tools } = req.body;
        let UserPrompt = "For this query, the system has retrieved the following relevant information from ${businessName}’s database:  \n ${contexts}  \n Using this institutional data, generate a clear, precise, and tailored response to the following user inquiry: \n ${userMessage}  \n If the retrieved data does not fully cover the query, acknowledge the limitation while still providing the most relevant response possible."
        if (!urls || !source) return res.status(400).json({ error: 'Missing url or source' });
        const client = await MongoClient.connect(process.env.GEN_MONGO_URL);
        await Initiator(urls, source, businessName.replace());
        const mainDoc = await client.db("Demonstrations").collection("Admin").insertOne({ urls: urls, businessName, institutionName, systemPrompt, UserPrompt, tools, dp: "", themeId: "", facts: "" });
        await client.close();
        return res.json({
            success: true,
            data: mainDoc
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/client/:clientId", async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.GEN_MONGO_URL);
        let clientDetails = await client.db("Demonstrations").collection("Admin").findOne({ _id: new ObjectId(req.params.clientId) }, { projection: { businessName: 1, dp: 1, themeId: 1, facts: 1, questions: 1 } });
        if (!clientDetails) return res.status(404).json({ error: 'Client not found' });
        await client.close();
        res.status(200).json({ success: true, message: "Client info", data: clientDetails })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
})
app.post('/chat-bot', async (req, res) => {
    try {
        const { userMessage, prevMessages = [], clientId, streamOption = false } = req.body;
        const client = await MongoClient.connect(process.env.GEN_MONGO_URL);
        let { institutionName, businessName, systemPrompt, UserPrompt, tools } = await client.db("Demonstrations").collection("Admin").findOne({ _id: new ObjectId(clientId) });
        const message = { "query": userMessage, "response": "", "embeddingTokens": {}, "responseTokens": {}, clientId: new ObjectId(clientId) }
        const { context, data, embeddingTokens } = await getContext(institutionName, userMessage)
        message.embeddingTokens = embeddingTokens
        message.context = context
        if (data == "") console.log("Empty context received")
        if (!streamOption) {
            const { choices, model, usage } = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { "role": "system", "content": systemPrompt },
                    ...prevMessages,
                    {
                        role: "user",
                        content: UserPrompt.replace("${contexts}", data).replace("${userMessage}", userMessage).replace("${businessName}", businessName)
                    }],
                tools: tools.length > 1 ? tools : null,
                store: tools.length > 1 ? true : null,
                tool_choice: tools.length > 1 ? "auto" : null,
            })
            message.responseTokens = { model, usage }
            message.response = choices[0].message.content
            await client.db("Demonstrations").collection("Analysis").insertOne(message);
            await client.close();
            return res.status(200).send({ success: true, data: choices[0].message.content })  // if tools are used then it works differently
        }
        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { "role": "system", "content": systemPrompt, },
                ...prevMessages,
                {
                    role: "user",
                    content: UserPrompt.replace("${contexts}", data).replace("${userMessage}", userMessage)
                }],
            stream: true,
            tools: tools.length > 1 ? tools : null,
            store: tools.length > 1 ? true : null,
            tool_choice: tools.length > 1 ? "auto" : null,
        });
        let finalToolCalls = [];
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');
        for await (const chunk of stream) {
            const { choices } = chunk
            if (chunk.choices[0].finish_reason === "stop") {
                const { model, usage } = chunk
                message.responseTokens = { model, usage }
            }
            const toolCalls = choices[0].delta.tool_calls || [];
            for (const toolCall of toolCalls) {
                const { index } = toolCall;
                if (!finalToolCalls[index]) finalToolCalls[index] = toolCall;
                finalToolCalls[index].function.arguments += toolCall.function.arguments;
            }
            if (choices[0]?.delta?.content !== null && choices[0]?.delta?.content !== undefined) {
                message.response += choices[0]?.delta?.content
                res.write(JSON.stringify({ chunk: choices[0]?.delta?.content, toolResponse: [] }));
            }
        }
        const functionCalls = []
        finalToolCalls.forEach(ele => {
            let parameters = JSON.parse(ele.function.arguments); // Parse the arguments string
            let functionName = ele.function.name; // Get the function name
            const result = toolFunctions[functionName](parameters)
            functionCalls.push(result)
        });
        await client.db("Demonstrations").collection("Analysis").insertOne(message);
        await client.close();
        res.end(JSON.stringify({
            chunk: "",
            toolResponse: functionCalls
        }))
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
app.post('/v3/chat-bot', async (req, res) => {
    try {
        const { userMessage, prevMessages = [] } = req.body;
        if (!userMessage) return res.status(400).send({ success: false, data: { "userMessage": userMessage } })
        const contexts = await getContextFromFullSite(userMessage)
        if (contexts == "") console.log("Empty context received")

        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{
                "role": "system",
                "content": `You are a knowledgeable assistant specifically designed to provide accurate, concise, and actionable information about Christian Brothers University (CBU). 
                            Your primary responsibility is to leverage tools where appropriate for missing or follow-up details. When answering user queries:
                            - If the information is incomplete or follow-up details are needed, prioritize calling the appropriate tool.
                            - If the user's query can be directly answered based on the provided context, respond with clear and precise content.
                            Always ensure your response is aligned with CBU's offerings, and default to tool use only when relevant. Avoid providing irrelevant information.`,
                // "content": "You are a knowledgeable assistant designed to provide accurate, concise, and personalized information about Christian Brothers University (CBU). Your responses are based exclusively on verified information from the institution's RAG (Retrieval-Augmented Generation) database. When answering, ensure the information is directly relevant to the user's query and aligned with CBU's offerings, services, or institutional knowledge.  Do not answer questions that are  unrelated to university.Answer in same language as user. Use tools like followup questions if necessary to suggest follow-up questions the user might ask which are relavant to informating given above for better understanding",
            }, ...prevMessages, {
                role: "user",
                content: `For this query, the system has retrieved the following relevant information from CBU's database: 
                        ${contexts}\n
                        Using this institutional data, provide a tailored and precise response to the following user query: 
                        "${userMessage}"`
            }],
            stream: true,
            tools: tools,
            store: true,
            tool_choice: "auto",
        });
        let finalToolCalls = [];
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');
        for await (const chunk of stream) {
            const toolCalls = chunk.choices[0].delta.tool_calls || [];
            for (const toolCall of toolCalls) {
                const { index } = toolCall;
                if (!finalToolCalls[index]) finalToolCalls[index] = toolCall;
                finalToolCalls[index].function.arguments += toolCall.function.arguments;
            }
            if (chunk.choices[0]?.delta?.content !== null && chunk.choices[0]?.delta?.content !== undefined) res.write(JSON.stringify({ chunk: chunk.choices[0]?.delta?.content, toolResponse: [] }));
        }
        const functionCalls = []
        finalToolCalls.forEach(ele => {
            let parameters = JSON.parse(ele.function.arguments); // Parse the arguments string
            let functionName = ele.function.name; // Get the function name
            const result = toolFunctions[functionName](parameters)
            functionCalls.push(result)
        });
        console.log("chunking done, sending all at once");

        res.end(JSON.stringify({
            chunk: "",
            toolResponse: functionCalls
        }))
    } catch (error) {
        console.error("Error with chatbot API:", error);
    }
})
app.listen(port, () => console.log(`Example app listening on port http://localhost:${port}`))
