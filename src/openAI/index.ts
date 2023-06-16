import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { CheckinCheckout, GuestFromChat } from "../../types/global";
import { createOpenAIUsage } from "../queries-prisma/db-queries";
// import { CheckinCheckout } from "../../types/global";

const openAiChat = new ChatOpenAI({
  temperature: 0.2,
  modelName: "gpt-3.5-turbo",
});
const promptDocumentExtract = `Olá, ChatGPT! Tenho um arquivo de texto com informações desestruturadas de um chat contendo detalhes dos hóspedes de um hotel. Gostaria de sua ajuda para extrair os nomes e CPFs dos hóspedes mencionados no texto. O seu retorno deve ser apenas um JSON Array contendo o document e o name. Caso não encontre, retorne um array vazio.`;
const promptDates = `Hello, ChatGPT! I have a text file with unstructured information from a chat containing details of hotel guests. I would like your help to extract the check-in and check-out dates from the text, as well as the price. The date does not include the year, so please assume the current year in your response. Your answer should only contain the JSON with the checkin, checkout, and price. The date format should be 'yyyy-MM-dd'. The price should be in numeric format with 2 decimal places, for example, 744.33. If any value is not found, it should be included in the JSON with null values`;

const extractCheckinCheckout = async (
  text?: string | undefined | null
): Promise<CheckinCheckout> => {
  if (text == undefined || text == null)
    return { checkin: null, checkout: null, price: null };
  const openAiResult = await openAiChat.generate([
    [new SystemChatMessage(promptDates), new HumanChatMessage(text)],
  ]);

  await saveUsage(openAiResult);
  const dates = await getDates(openAiResult);

  return dates;
};
const saveUsage = async (openAiResult: any) => {
  try {
    const completionTokens =
      openAiResult.llmOutput?.tokenUsage?.completionTokens ?? 0;
    const promptTokens = openAiResult.llmOutput?.tokenUsage?.promptTokens ?? 0;
    const totalTokens = openAiResult.llmOutput?.tokenUsage?.totalTokens ?? 0;
    await createOpenAIUsage(completionTokens, promptTokens, totalTokens);
  } catch (error) {
    console.log("saveUsage-error:", error);
  }
};

const getDates = async (openAiResult: any) => {
  let result = "";
  try {
    result = openAiResult?.generations[0][0].text;
    return JSON.parse(result);
  } catch (error) {
    console.log("error parsing", error, result);
    return {};
  }
};
const getGuests = async (openAiResult: any) => {
  let result = "";
  try {
    result = openAiResult?.generations[0][0].text;
    return JSON.parse(result);
  } catch (error) {
    console.log("error parsing", error, result);
    return [{}];
  }
};

const extractNameAndDocumentGuests = async (
  text: string
): Promise<GuestFromChat[]> => {
  const openAiResult = await openAiChat.generate([
    [new SystemChatMessage(promptDocumentExtract), new HumanChatMessage(text)],
  ]);

  await saveUsage(openAiResult);
  const guests = await getGuests(openAiResult);
  return guests;
};

export { extractCheckinCheckout, extractNameAndDocumentGuests };
