/**
 * Elite Bot — Worker
 *
 * Scheduler de jobs usando node-cron.
 *
 * Schedules:
 *   JOB-001 ingest-prices    → a cada 30 minutos
 *   JOB-002 match-products   → a cada hora
 *   JOB-003 calculate-deals  → a cada hora (após match)
 *   JOB-004 process-alerts   → a cada 15 minutos
 */

import 'dotenv/config';
import cron from 'node-cron';

import { jobIngestPrices }   from './jobs/job-ingest-prices.ts';
import { jobMatchProducts }  from './jobs/job-match-products.ts';
import { jobCalculateDeals } from './jobs/job-calculate-deals.ts';
import { jobProcessAlerts }  from './jobs/job-process-alerts.ts';
import { db }                from './database/client.ts';

// Guarda se um job já está rodando para evitar execuções sobrepostas
const running: Record<string, boolean> = {};

function schedule(name: string, cronExpr: string, fn: () => Promise<unknown>) {
  cron.schedule(cronExpr, async () => {
    if (running[name]) {
      console.log(`[scheduler] ${name} still running, skipping`);
      return;
    }
    running[name] = true;
    try {
      await fn();
    } catch (err) {
      console.error(`[scheduler] ${name} unhandled error`, err);
    } finally {
      running[name] = false;
    }
  });
  console.log(`[scheduler] registered ${name} → ${cronExpr}`);
}

async function main() {
  console.log('[worker] starting Elite Bot Worker');

  // Verifica conexão com o banco antes de registrar os jobs
  await db.query('SELECT 1');
  console.log('[worker] database connection OK');

  // JOB-001 — a cada 30 minutos
  schedule('ingest-prices',   '*/30 * * * *', jobIngestPrices);

  // JOB-002 — a cada hora (no minuto 5)
  schedule('match-products',  '5 * * * *',    jobMatchProducts);

  // JOB-003 — a cada hora (no minuto 10, após o match)
  schedule('calculate-deals', '10 * * * *',   jobCalculateDeals);

  // JOB-004 — a cada 15 minutos
  schedule('process-alerts',  '*/15 * * * *', jobProcessAlerts);

  console.log('[worker] all jobs scheduled — running');
}

main().catch((err) => {
  console.error('[worker] fatal startup error', err);
  process.exit(1);
});
