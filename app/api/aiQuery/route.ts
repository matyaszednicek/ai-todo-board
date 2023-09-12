import { readFile } from 'fs/promises';
import path from 'path';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { NextResponse } from 'next/server';

const PROMPT_TEMPLATES_PATH = '/lib/promptTemplates/';

export async function POST(request: Request) {
  const { message } = await request.json();

  const systemPromptPath = path.join(process.cwd(), PROMPT_TEMPLATES_PATH, '/system.txt');
  const systemPrompt = await readFile(systemPromptPath, 'utf-8');
  const humanPromptPath = path.join(process.cwd(), PROMPT_TEMPLATES_PATH, '/human.txt');
  const humanPrompt = await readFile(humanPromptPath, 'utf-8');

  const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(systemPrompt);
  const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate(humanPrompt);

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([systemMessagePrompt, humanMessagePrompt]);

  const chat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    maxTokens: 50,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    modelName: 'gpt-3.5-turbo',
  });
  const chain = new LLMChain({
    llm: chat,
    prompt: chatPrompt,
  });

  const result = await chain.call({
    text: message,
  });

  try {
    const json = JSON.parse(result.text);

    return NextResponse.json<AIResponse>(json);
  } catch (error: any) {
    console.log({ error });
    return NextResponse.json<AIResponse>({ error: error.message, action: '', column: '', title: '' });
  }
}
