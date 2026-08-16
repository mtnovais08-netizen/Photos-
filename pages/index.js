import { useState } from 'react';

export default function Home() {
  const [siteUrl, setSiteUrl] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchImages(e) {
    e?.preventDefault();
    setError('');
    setLoading(true);
    setImages([]);
    try {
      const res = await fetch(`/api/fetch-images?url=${encodeURIComponent(siteUrl)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao buscar imagens');
      setImages(data.images || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function proxyLink(cleaned, opts = {}) {
    const params = new URLSearchParams();
    params.set('url', cleaned);
    if (opts.w) params.set('w', opts.w);
    if (opts.scale) params.set('scale', opts.scale);
    return `/api/image-proxy?${params.toString()}`;
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Image Scraper & Resizer</h1>
      <form onSubmit={fetchImages} style={{ marginBottom: 16 }}>
        <input
          placeholder="https://exemplo.com/pagina"
          value={siteUrl}
          onChange={e => setSiteUrl(e.target.value)}
          style={{ width: '60%', padding: 8 }}
        />
        <button type="submit" style={{ marginLeft: 8, padding: '8px 12px' }}>
          Buscar imagens
        </button>
      </form>

      {loading && <div>Buscando...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div>
        {images.map((img, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
            <div style={{ width: 160, height: 120, overflow: 'hidden', border: '1px solid #ddd' }}>
              {/* apresenta a versão proxy padrão (sem tamanho) */}
              <img
                src={proxyLink(img.cleaned, { w: 320 })}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div><strong>Original:</strong> <a href={img.original} target="_blank" rel="noreferrer">{shorten(img.original)}</a></div>
              <div><strong>Limpa:</strong> <a href={img.cleaned} target="_blank" rel="noreferrer">{shorten(img.cleaned)}</a></div>

              <div style={{ marginTop: 8 }}>
                <label>Largura (px): </label>
                <a
                  href={proxyLink(img.cleaned, { w: 200 })}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginRight: 8 }}
                >
                  200px
                </a>
                <a href={proxyLink(img.cleaned, { w: 400 })} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>
                  400px
                </a>
                <a href={proxyLink(img.cleaned, { scale: 0.5 })} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>
                  50%
                </a>
                <a href={proxyLink(img.cleaned, { scale: 2 })} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>
                  200%
                </a>
              </div>

              <div style={{ marginTop: 6 }}>
                Link do proxy (pode compartilhar): <code style={{ wordBreak: 'break-all' }}>{proxyLink(img.cleaned)}</code>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function shorten(s) {
  if (!s) return '';
  return s.length > 80 ? s.slice(0, 60) + '...' + s.slice(-15) : s;
}
