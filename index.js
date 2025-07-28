import express from "express";
import cors from 'cors';
import { downloadYouTubeVideo } from './download.js';
import path from 'path';
import { fileURLToPath } from 'url';
import ytdl from 'ytdl-core';
import { spawn } from 'child_process';


const url = 'https://youtu.be/bZ0upTodViY'; // Reemplaza con la URL real
const outputFile = 'mi_video.mp4';


const app = express()

const products = [
    {
        id: 1,
        name: "Camiseta Deportiva",
        price: 150,
        categories: ["ropa", "deportes"]
    },
    {
        id: 2,
        name: "Calzado Deportiva",
        price: 150,
        categories: ["calzado", "deportes"]
    }
]

app.use((req, res, next) => {
    //res.json();
    console.log(req.method);
    next();
})

app.use(cors()); // permite todos los orígenes (para desarrollo)

app.get('/', (req, res) => {
    downloadYouTubeVideo(url, outputFile);
    res.json({message: "Bienvenido"})
    
})

/*app.get("/products", (req, res) =>{
    res.json(products)
})*/

app.get("/products", (req, res) => {

    console.log("categories")
    const {category} = req.query;
    if(category){
        const productsFiltered = products.filter(item =>
             item.categories.includes(category))
        console.log(category)
        return res.json(productsFiltered);
    }
    res.json(products);
})

app.get("/products/:id", (req, res) => {
    const id  = parseInt(req.params.id);

    const product = products.find((item) => item.id ==id);

    if(!product){
        res.status(404).json({error: "No existe el producto"});
    }
    res.json(product)
})


// Necesario para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta para descargar video (opcional, si quieres que lo descargue desde la API)
app.get('/download', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('Falta parámetro ?url=');
  }

  const output = path.join(__dirname, 'mi_video.mp4');
  await downloadYouTubeVideo(url, output);
  res.send('✅ Video descargado.');
});


/*// Ruta para servir el video
app.get('/video', (req, res) => {
  const videoPath = path.join(__dirname, 'mi_video.mp4');

  // Establecer headers para reproducirlo directamente
  res.setHeader('Content-Type', 'video/mp4');

  // Opción: soportar range headers para streaming (más avanzado)
  // Pero aquí lo enviamos completo:
  res.sendFile(videoPath);
});*/

app.get('/video', (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).send('Falta parámetro ?url=');
  }

  // Forzar descarga en el cliente
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');

  // Ejecutar yt-dlp con salida al stdout (pipe)
  const ytdlp = spawn('yt-dlp', ['-f', 'best', '-o', '-', videoUrl]);

  // Pipe directo del stdout de yt-dlp al response (cliente)
  ytdlp.stdout.pipe(res);

  ytdlp.stderr.on('data', data => {
    console.error(`yt-dlp stderr: ${data.toString()}`);
  });

  ytdlp.on('error', err => {
    console.error('Error ejecutando yt-dlp:', err);
    if (!res.headersSent) res.status(500).send('Error descargando video');
  });

  ytdlp.on('close', code => {
    if (code !== 0) {
      console.error(`yt-dlp terminó con código ${code}`);
      // Terminar la respuesta si no está terminada
      if (!res.finished) res.end();
    }
  });
});

import notFound from "./src/middlewares/not-found.js";
app.use(notFound)

const PORT = 3000

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));