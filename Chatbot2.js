import dotenv from 'dotenv'
dotenv.config()
import {
    SystemMessage,
    HumanMessage,
    AIMessage,
    trimMessages,
  } from "@langchain/core/messages"

process.env.LANGSMITH_TRACING  ='true'
const LANGSMITH_API_KEY  = process.env.LANGSMITH_API_KEY
const GEMINI_API = process.env.GOOGLE_API_KEY
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    apiKey : GEMINI_API
});

import { START, END, MessagesAnnotation, StateGraph, MemorySaver } from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";

// First workflow
const callModel = async (state) => {
    const res = await llm.invoke(state.messages);
    return { messages: [res] };
};

const workflow = new StateGraph(MessagesAnnotation)
    .addNode("model", callModel)
    .addEdge(START, "model")
    .addEdge("model", END);

const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });

// ✅ use the SAME thread_id for all turns in this conversation
const config = { configurable: { thread_id: uuidv4() } };

const input1 = [{ role: "user", content: "Hi! I'm Raghu" }];
const output1 = await app.invoke({ messages: input1 }, config);
console.log(output1.messages[output1.messages.length - 1]);

const input2 = [{ role: "user", content: "What's my name?" }];
const output2 = await app.invoke({ messages: input2 }, config);
console.log(output2.messages[output2.messages.length - 1]);

// Second workflow with pirate style
import { ChatPromptTemplate } from '@langchain/core/prompts';

const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You talk like a pirate. Answer all questions to the best of your ability.",
    ],
    ["placeholder", "{messages}"],
]);

const callModel2 = async (state) => {
    const prompt = await promptTemplate.invoke(state);
    const response = await llm.invoke(prompt);
    return { messages: [response] };
};

const workflow2 = new StateGraph(MessagesAnnotation)
    .addNode("model", callModel2)
    .addEdge(START, "model")
    .addEdge("model", END);

// This is for adding the memory
const app2 = workflow2.compile({ checkpointer: new MemorySaver() });

const config3 = { configurable: { thread_id: uuidv4() } };

// ✅ wrap in object for LangGraph
const input4 = [
    { role: "user", content: "HI I'm a coder and name is Sri Hari" }
];
const output4 = await app2.invoke({ messages: input4 }, config3);
console.log(output4.messages[output4.messages.length - 1]);

const input5 = [
    { role: "user", content: "What's my name?" }
];
const output5 = await app2.invoke({ messages: input5 }, config3);
console.log(output5.messages[output5.messages.length - 1]);



const trimmer = trimMessages({
    maxTokens: 10,
    strategy: "last",
    tokenCounter: (msgs) => msgs.length,
    includeSystem: true,
    allowPartial: false,
    startOn: "human",
  });
  
  const messages = [
    new SystemMessage("you're a good assistant"),
    new HumanMessage("hi! I'm bob"),
    new AIMessage("hi!"),
    new HumanMessage("I like vanilla ice cream"),
    new AIMessage("nice"),
    new HumanMessage("whats 2 + 2"),
    new AIMessage("4"),
    new HumanMessage("thanks"),
    new AIMessage("no problem!"),
    new HumanMessage("having fun?"),
    new AIMessage("yes!"),
  ];
  
  await trimmer.invoke(messages);


  const callModel4 = async (state)=>{
     const trimmer = await trimmer.invoke(state.messages);
     const prompt = await promptTemplate.invoke({
        messages:trimMessages,
        language :state.language
     });
     const response = await llm.invoke(prompt);
     return { messages: [response] };
  }


  const workflow4 = new StateGraph(GraphAnnotation)
  .addNode("model", callModel4)
  .addEdge(START, "model")
  .addEdge("model", END);

const app4 = workflow4.compile({ checkpointer: new MemorySaver() });

const config5 = { configurable: { thread_id: uuidv4() } };
const input8 = {
  messages: [...messages, new HumanMessage("What is my name?")],
  language: "Tamil",
};

const output9 = await app4.invoke(input8, config5);
console.log(output9.messages[output9.messages.length - 1]);