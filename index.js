import dotenv from "dotenv"
dotenv.config()

const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY
const LANGSMITH_TRACING = process.env.LANGSMITH_TRACING === "true"
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

import {ChatGoogleGenerativeAI } from "@langchain/google-genai"

const model = new ChatGoogleGenerativeAI({
    apiKey: GOOGLE_API_KEY, // ✅ Use your Google API key
    model: "gemini-2.0-flash",
    temperature: 0.8,
    maxTokens: 1024,
    topP: 0.95,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
});


import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const messages = [
    new SystemMessage("You are a helpful assistant."),
    new HumanMessage("Who won the world series in 2020?")
];
await model.invoke(messages);
await model.invoke("Hello");

await model.invoke([{ role: "user", content: "Hello" }]);

await model.invoke([new HumanMessage("hi!")]);

const stream = await model.stream(messages);

const chunks = [];
for await (const chunk of stream) {
  chunks.push(chunk);
  console.log(`${chunk.content}|`);
}

import { ChatPromptTemplate } from "@langchain/core/prompts";

const systemTemplate = "Translate the following from English into {language}";
const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["user", "{text}"],
  ]);

  const promptValue = await promptTemplate.invoke({ language: "Tamil", text: "Hello, how are you?" });
  promptValue;
promptValue.toChatMessages();

const response = await model.invoke(promptValue);
console.log(`${response.content}`);

