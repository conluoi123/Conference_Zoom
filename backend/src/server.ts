import express from "express"
import dotenv from "dotenv"
import cors from "cors"


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

//middlewares
app.use(express.json());


app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
})
