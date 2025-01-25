function followUpQuestions(questions) {
    /** Generate follow-up questions for better understanding */
    return JSON.stringify(
        questions.map((question) => ({
            question: question.text,
            probability: question.probability,
        }))
    );
}
function requestMoreInfo(args) {
    /** Request more information from the user when the model is unable to answer */

    return { ...args, functionName: "requestMoreInfo" };
}
export const toolFunctions = {
    followUpQuestions,
    requestMoreInfo
}
export const tools = [
    {
        type: "function",
        function: {
            name: "requestMoreInfo",
            description: "A function to notify the development team about the specific details that need to be provided to user which are missing in the knowledge base",
            parameters: {
                type: "object",
                properties: {
                    messageToUser: {
                        type: "string",
                        description: "Polite message to user that we do not have access to that piece information at the moment. we will get back to him if he provides his user details",
                    },
                    messageToDeveloper: {
                        type: "string",
                        description: "straight forward notice to the developer about the missing information ",
                    }
                },
                required: ["messageToUser", "messageToDeveloper"],
            },
        },
    },
    // {
    //     type: "function",
    //     function: {
    //         name: "userDetails",
    //         description: "A function to request missing information from the user and notify the development team about the specific details that need to be provided.",
    //         parameters: {
    //             type: "object",
    //             properties: {
    //                 messageToUser: {
    //                     type: "string",
    //                     description: "Polite message to user that we do not have access to that piece information at the moment. we will get back to him if he provides his user details",
    //                 },
    //                 messageToDeveloper: {
    //                     type: "string",
    //                     description: "straight forward notice to the developer about the missing information ",
    //                 }
    //             },
    //             required: ["messageToUser","messageToDeveloper"],
    //         },
    //     },
    // },
    {
        type: "function",
        function: {
            name: "followUpQuestions",
            description: "Provide potential follow-up questions the user might ask for better understanding",
            parameters: {
                type: "object",
                properties: {
                    questions: {
                        type: "array",
                        description: "List of possible follow-up questions and their probabilities",
                        items: {
                            type: "object",
                            properties: {
                                text: {
                                    type: "string",
                                    description: "The follow-up question text",
                                },
                                probability: {
                                    type: "number",
                                    description: "The likelihood (in percentage) of the user asking this question",
                                },
                            },
                            required: ["text", "probability"],
                        },
                    },
                },
                required: ["questions"],
            },
        },
    },
];