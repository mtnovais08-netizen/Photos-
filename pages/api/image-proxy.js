import sharp from 'sharp';

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

    let img = sharp(inputBuffer, { failOnError: false });
    const metadata = await img.metadata();

    let targetWidth = metadata.width || null;

    if (w) {
      const parsed = parseInt(w, 10);
      if (!Number.isNaN(parsed) && parsed > 0) targetWidth = parsed;
    } else if (scale) {
      const s = parseFloat(scale);
      if (!Number.isNaN(s) && metadata.width) targetWidth = Math.round(metadata.width * s);
    }

    if (targetWidth && metadata.width) {
      img = img.resize({ width: targetWidth });
    }

    // output format heurística
    const fmt = (metadata.format || 'jpeg').toLowerCase();
    if (fmt === 'png') img = img.png({ quality: 80 });
    else if (fmt === 'webp') img = img.webp({ quality: 80 });
    else img = img.jpeg({ quality: 80 });

    const outBuffer = await img.toBuffer();

    // content-type
    const ct = fmt === 'jpg' ? 'image/jpeg' : `image/${fmt === 'jpg' ? 'jpeg' : fmt}`;
    res.setHeader('Content-Type', ct);
    // cache long time — o link é baseado na url de origem + params (cuidado com invalidações)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(outBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
