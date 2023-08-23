import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { Car, CheckinCheckout, GuestFromChat } from "../../types/global";
import { createOpenAIUsage } from "../queries-prisma/db-queries";

const openAiChat = new ChatOpenAI({
  temperature: 1.0,
  modelName: "gpt-3.5-turbo-16k-0613",
});
const promptDocumentExtract = `Olá, ChatGPT! Tenho um arquivo de texto com informações desestruturadas de um chat contendo detalhes dos hóspedes de um hotel. Gostaria de sua ajuda para extrair os nomes e CPFs dos hóspedes mencionados no texto. O seu retorno deve ser apenas um JSON Array contendo o document e o name. Caso não encontre, retorne um array vazio.`;
const promptVehicle = `NO texto abaixo o anfitrião pergunta se o hospede utilizará carro. É possível saber, pela resposta do hospede, se o hospede utilizará carro? Sem inferir respostas. Retorne um JSON contendo car: true para tem carro, false para não tem carro, null para indeterminado, plate: contendo a placa do carro.`;
const promptDates = `O texto que provisionei contem a data de checkin e checkout. Sem o ano. Estamos no mês ${new Date().getMonth()} do ano de ${ new Date().getFullYear() }. Formate-a em yyyy-MM-dd assumindo o ano que seja mais provavel. Ou seja, em um exemplo em que estamos em no mês 12 de 2023 e o checkin é para as datas '22 – 26 de jan.' o ano deve ser 2024 e não 2023 - nunca deve ir para o passado! Se não conseguir determinar, assuma o ano ${new Date().getFullYear()} Sua resposta deve conter apenas o JSON com os campos checkin, checkout. `;

const extractCheckinCheckout = async (
  text?: string | undefined | null
): Promise<CheckinCheckout> => {
  if (text == undefined || text == null)
    return { checkin: null, checkout: null, price: null };
  const openAiResult = await openAiChat.generate([
    [new SystemChatMessage(promptDates), new HumanChatMessage(text)],
  ]);

  await saveUsage(openAiResult);
  // console.log('result - datas', openAiResult)
  const dates = (await getJson(openAiResult)) as CheckinCheckout;

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

const extractVehicle = async (text: string | null): Promise<Car> => {
  if (text == undefined || text == null) return {} as Car;
  const openAiResult = await openAiChat.generate([
    [new SystemChatMessage(promptVehicle), new HumanChatMessage(text)],
  ]);

  await saveUsage(openAiResult);
  const vehicle = getJson(openAiResult);
  return vehicle as Car;
};
const extractJson = async (text: string | null, isArray: boolean = false) => {
  const jsonObjectRegex = /{[^{}]*}/;
  const jsonArrayRegex = /\[.*\]/s;
  let jsonMatch = text?.match(jsonArrayRegex);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);
  jsonMatch = text?.match(jsonObjectRegex);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);
  return isArray ? [{}] : {};
};
const getJson = (
  openAiResult: any,
  isArray: boolean = false
): Array<Object> | Object => {
  let result = "";
  try {
    result = openAiResult?.generations[0][0].text;
    console.log("result-json", result);
    return extractJson(result);
  } catch (error) {
    console.log("error parsing", error, result);
    return isArray ? [{}] : {};
  }
};

const extractNameAndDocumentGuests = async (
  text: string
): Promise<GuestFromChat[]> => {
  const openAiResult = await openAiChat.generate([
    [new SystemChatMessage(promptDocumentExtract), new HumanChatMessage(text)],
  ]);

  await saveUsage(openAiResult);
  const guests = await getJson(openAiResult, true);
  return guests as GuestFromChat[];
};

export { extractCheckinCheckout, extractNameAndDocumentGuests, extractVehicle };
