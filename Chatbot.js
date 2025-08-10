import dotenv from 'dotenv'
dotenv.config()

process.env.LANGSMITH_TRACING  ='true'
const LANGSMITH_API_KEY  = process.env.LANGSMITH_API_KEY
const GEMINI_API = process.env.GOOGLE_API_KEY
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    apiKey : GEMINI_API
});

//const res1=await llm.invoke([{role:"user" ,content:"Hi iam Raghu"}])
//console.log(res1)
//const res2 =await llm.invoke([{ role: "user", content: "Whats my name" }]);

/*const res =await llm.invoke([
    { role: "user", content: "Hi! I'm Raghu" },
    { role: "assistant", content: "Hello Raghu! How can I assist you today?" },
    { role: "user", content: "What's my name?" },
]);

console.log(res)


//console.log(res2)

*/

import {START,END,MessagesAnnotation,StateGraph,MemorySaver} from "@langchain/langgraph"

const callModel = async (state) =>{
    const res = await llm.invoke(state.messages);
    return {messages:[res]};
}

const workflow = new StateGraph(MessagesAnnotation).addNode("model",callModel).addEdge(START,"model").addEdge("model",END);

const memory = new MemorySaver();
const app = workflow.compile({checkpointer:memory});


import {v4 as uuidv4} from "uuid";

/*const config = { configurable: { thread_id: uuidv4() } };


const input = [{
    role :"user",content :"Hi! I'm Raghu",
}]

const output = await app.invoke({messages:input},config);
console.log(output.messages[output.messages.length - 1]);

const input2 = [
    {
      role: "user",
      content: "What's my name?",
    },
  ];
  const output2 = await app.invoke({ messages: input2 }, config);
  console.log(output2.messages[output2.messages.length - 1]);
*/


const config2 = {configurable: { thread_id: uuidv4() } };

const input3 = [
    {
        role:"user",content:"What's my name?"
    }
]

const output3 = await app.invoke({messages:input3},config2);
console.log(output3.messages[output3.messages.length - 1]);


import { ChatPromptTemplate } from '@langchain/core/prompts'
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
    return {messages: [response]};
};

const workflow2 = new StateGraph(MessagesAnnotation).addNode("model",callModel2).addEdge(START,"model").addEdge("model",END);



  //This is for adding the memory
  const app2 = workflow2.compile({ checkpointer: new MemorySaver() });


  const config3 = {configurable: { thread_id: uuidv4() } };

const input4 = [
    {
        role:"user",content:"HI I'm a coder and name is Sri Hari"

    }   
    
]

const output4 = await app2.invoke(input4,config3);
console.log(output4.messages[output4.messages.length - 1]);
