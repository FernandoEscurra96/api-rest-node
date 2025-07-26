import express from "express";
import cors from 'cors';

const app = express()

app.use(cors()); // permite todos los orígenes (para desarrollo)

app.get('/', (req, res) => {
    res.send({"message": "Bienvenido"})
})
const PORT = 3000

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));