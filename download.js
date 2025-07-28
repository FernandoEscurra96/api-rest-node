import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Descarga un video de YouTube usando yt-dlp.
 * @param {string} url - URL del video de YouTube.
 * @param {string} output - Ruta del archivo de salida.
 */
export async function downloadYouTubeVideo(url, output) {
  try {
    const command = `yt-dlp -f best -o "${output}" "${url}"`;
    console.log(`▶️ Ejecutando: ${command}`);
    
    const { stdout, stderr } = await execAsync(command);
    console.log(stdout);
    if (stderr) console.error('stderr:', stderr);
    console.log(`✅ Descarga completada: ${output}`);
  } catch (err) {
    console.error('❌ Error al descargar con yt-dlp:', err.message);
  }
}
