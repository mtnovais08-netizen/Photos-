# Image Scraper + Resizer (Vercel)

Projeto Next.js que:
- Raspagens simples de imagens de qualquer site (img tags e background-image inline).
- Remove parâmetros de qualidade/resize nas URLs das imagens.
- Endpoints de proxy para redimensionar proporcionalmente usando Jimp.
- Pode ser implantado no Vercel.

Como usar (local):
1. Instale dependências:
   npm install

2. Rode em desenvolvimento:
   npm run dev
   Abra http://localhost:3000

Endpoints principais:
- GET /api/fetch-images?url=<URL_DO_SITE>
  -> Retorna JSON com imagens encontradas e URLs "limpas" (sem parâmetros de qualidade).
- GET /api/image-proxy?url=<URL_DA_IMAGEM>&w=<LARGURA_EM_PX>
  -> Retorna a imagem redimensionada pela largura especificada (mantém proporção).
  Também aceita &scale=<FATOR> (por exemplo scale=0.5 para reduzir pela metade).

Deploy:
- No Vercel, importe o repositório e faça deploy (Next.js funciona bem; Jimp evita dependências nativas).

Aviso legal:
- Teste com permissão dos sites alvo. Respeite robots.txt e termos de uso.
