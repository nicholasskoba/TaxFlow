import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`API server is running on http://localhost:${env.PORT}`);
});
