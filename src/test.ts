import { getCpfAndNameFromChatText, getNameByCpf } from "./provider/cpf-finder";
import {
  getGuests,
  updateEntriesWithDateNamesAndDocuments,
} from "./queries-prisma/db-queries";

(async () => {
  await updateEntriesWithDateNamesAndDocuments();
})();
