import Jimp from 'jimp';

/**
 * GET /api/image-proxy?url=<encoded-image-url>&w=<px>&scale=<float>
 * - w: largura em px
 * - scale: multiplicador (0.5 = metade da largura original)
 *
 * Retorna a imagem processada com header Content-Type apropriado.
 */
export default async function handler(req, res) {
  const { url, w, scale } = req.query;
  if (!url) return res.status(400).json({ error: 'Parâmetro url é obrigatório' });

  try {
    const upstream = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!upstream.ok) return res.status(502).json({ error: 'Falha ao buscar imagem de origem' });

    const arr = await upstream.arrayBuffer();
    const inputBuffer = Buffer.from(arr);

    const image = await Jimp.read(inputBuffer);
    const metadataWidth = image.bitmap?.width || null;

    let targetWidth = metadataWidth;

    if (w) {
      const parsed = parseInt(w, 10);
      if (!Number.isNaN(parsed) && parsed > 0) targetWidth = parsed;
    } else if (scale) {
      const s = parseFloat(scale);
      if (!Number.isNaN(s) && metadataWidth) targetWidth = Math.round(metadataWidth * s);
    }

    if (targetWidth && metadataWidth) {
      image.resize(targetWidth, Jimp.AUTO);
    }

    // normalize to JPEG output for broad compatibility
    image.quality(80);
    const outBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(outBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
