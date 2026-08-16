import cheerio from 'cheerio';

/**
 * GET /api/fetch-images?url=<site-url>
 * Retorna JSON: { images: [ { original, cleaned, proxy } ] }
 */
export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Parâmetro url é obrigatório' });

  try {
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!resp.ok) return res.status(502).json({ error: 'Falha ao buscar a página origem' });
    const html = await resp.text();
    const $ = cheerio.load(html);

    const images = [];

    // img tags
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy');
      if (src) {
        try {
          const resolved = new URL(src, url).toString();
          const cleaned = stripQuality(resolved);
          images.push({
            original: resolved,
            cleaned,
            proxy: `/api/image-proxy?url=${encodeURIComponent(cleaned)}`
          });
        } catch (_) {}
      }
    });

    // inline background-image in style attributes
    $('[style]').each((_, el) => {
      const style = $(el).attr('style') || '';
      const m = /background-image:\s*url\(["']?([^"')]+)["']?\)/i.exec(style);
      if (m && m[1]) {
        try {
          const resolved = new URL(m[1], url).toString();
          const cleaned = stripQuality(resolved);
          images.push({
            original: resolved,
            cleaned,
            proxy: `/api/image-proxy?url=${encodeURIComponent(cleaned)}`
          });
        } catch (_) {}
      }
    });

    // remove duplicatas (pela cleaned URL)
    const unique = Array.from(new Map(images.map(i => [i.cleaned, i])).values());

    return res.status(200).json({ images: unique });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function stripQuality(u) {
  try {
    const urlObj = new URL(u);
    // parâmetros comuns que limitam qualidade ou definem resize
    const paramsToRemove = ['q', 'quality', 'w', 'h', 'width', 'height', 'fit', 'fm', 'auto', 'ixlib'];
    paramsToRemove.forEach(p => urlObj.searchParams.delete(p));
    // Se restarem apenas parâmetros vazios, remove '?' implícito quando convertido para string
    return urlObj.toString();
  } catch (e) {
    return u;
  }
}
