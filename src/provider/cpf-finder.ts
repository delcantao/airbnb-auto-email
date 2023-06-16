import { GuestFromChat } from "../../types/global";

const dotenv = require("dotenv");
dotenv.config();

const config = {
  user: process.env.PROVIDER_SQLS_USER,
  password: process.env.PROVIDER_SQLS_PASS,
  server: process.env.PROVIDER_SQLS_SERVER ?? "localhost",
  database: process.env.PROVIDER_SQLS_DBNAME,
  options: {
    encrypt: false,
    port: Number(process.env.PROVIDER_SQLS_PORT ?? 1433),
  },
};

const getCpfAndNameFromChatText = async (
  text: string | null | undefined
): Promise<GuestFromChat[]> => {
  if (!text) return [];
  const cpfs = await getGuestsCpfByRegex(text);
  const cpfAndNames = await Promise.all(
    cpfs.map(async (cpf: string) => {
      const name = await getNameByCpf(cpf);
      return { document: cpf, name };
    })
  );
  return cpfAndNames as GuestFromChat[];
};
const getGuestsCpfByRegex = async (text: any) => {
  const onlyNumbers = /\D+/g;
  const has11Digits = /\b\d{11}\b/g;
  const PointsAndMinus = /[.-]/g;
  const cpfFormatted = /\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11}/g;

  const found = text.match(cpfFormatted);
  if (!found) {
    text = text.replace(PointsAndMinus, "");
    text = text.replace(onlyNumbers, " ");
    return text.match(has11Digits);
  }
  return found;
};
const getNameByCpf = async (cpf: string | null): Promise<string | null> => {
  const mssql = require("mssql");
  let name = null;
  if (!cpf) return name;
  try {
    cpf = cpf.replace(/\D/g, "");
    if (!cpf) return name;

    await mssql.connect(config);
    const sql = `SELECT Dc_Nome FROM tb_Cpf WHERE Cd_Cpf = ${cpf}`;
    console.log(sql);
    const result = await mssql.query(sql);

    name = result.recordset[0]?.Dc_Nome;
  } catch (error) {
    console.error(error);
    return name;
  } finally {
    // Fechando a conexão
    if (mssql.connected) mssql.close();
  }
  return name ?? null;
};

export { getNameByCpf, getCpfAndNameFromChatText };
