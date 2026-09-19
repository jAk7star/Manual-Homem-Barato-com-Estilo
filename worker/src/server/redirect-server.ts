/**
 * HTTP Redirect Server — Monetização & Tracking de Afiliados (Fase 5)
 *
 * Expõe o endpoint HTTP de redirecionamento nativo na porta 3002.
 *
 * Rotas:
 *   GET /r?offer_id=<UUID>&source=<extension|website>&campaign=<nome>&user_id=<UUID>
 *   GET /r/<UUID>
 *   GET /health
 */

import http from 'node:http';
import { URL } from 'node:url';
import { registerClick } from '../agents/affiliate-agent.ts';

const PORT = parseInt(process.env.REDIRECT_PORT || '3002', 10);

export function startRedirectServer(): http.Server {
  const server = http.createServer(async (req, res) => {
    try {
      const reqUrl = req.url || '/';
      const parsedUrl = new URL(reqUrl, `http://localhost:${PORT}`);
      const pathname = parsedUrl.pathname;

      // Healthcheck
      if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'elitebot-redirect-server' }));
        return;
      }

      // Rota de Redirecionamento (/r ou /r/<offerId>)
      if (pathname === '/r' || pathname.startsWith('/r/')) {
        let offerId = parsedUrl.searchParams.get('offer_id') || parsedUrl.searchParams.get('id');

        // Suporte a caminho /r/<offerId>
        if (!offerId && pathname.startsWith('/r/')) {
          offerId = pathname.substring(3).trim();
        }

        if (!offerId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Parâmetro offer_id é obrigatório. Ex: /r?offer_id=UUID' }));
          return;
        }

        const sourceParam = parsedUrl.searchParams.get('source');
        const source = sourceParam === 'extension' ? 'extension' : 'website';
        const campaign = parsedUrl.searchParams.get('campaign') || undefined;
        const userId = parsedUrl.searchParams.get('user_id') || undefined;

        // Registra o clique e busca a URL de afiliado
        const result = await registerClick({
          offerId,
          userId,
          source,
          campaign,
        });

        if (!result) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Oferta não encontrada ou inativa' }));
          return;
        }

        console.log(
          `[affiliate-redirect] click_id=${result.clickId} offer_id=${offerId} source=${source} ➔ 302 Redirect to: ${result.affiliateUrl}`,
        );

        // Retorna Redirecionamento HTTP 302 Found
        res.writeHead(302, {
          Location: result.affiliateUrl,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        });
        res.end();
        return;
      }

      // Rota não encontrada
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Rota não encontrada. Utilize /r?offer_id=UUID' }));
    } catch (err) {
      console.error('[affiliate-redirect] Erro interno:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro interno ao processar o redirecionamento' }));
    }
  });

  server.listen(PORT, () => {
    console.log(`[affiliate-redirect] Servidor de monetização rodando na porta http://localhost:${PORT}`);
  });

  return server;
}
