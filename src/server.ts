import app from "./app";
import config from "./config";
import { initDB } from "./db";
const port = config.port || 3000;

const main = () => {
  initDB();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

main();