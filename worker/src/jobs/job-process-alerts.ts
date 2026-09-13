/**
 * JOB-004 — Process Alerts
 *
 * Verifica todos os alertas ativos e dispara notificação
 * quando o melhor preço atingir o target do usuário.
 *
 * Fluxo:
 *   alerts ativos → melhor preço → target_price → notificação
 */

import { processAlerts } from '../agents/alert-agent.ts';

interface JobResult {
  job: string;
  startedAt: Date;
  finishedAt?: Date;
  status: 'success' | 'error';
  alertsChecked: number;
  alertsTriggered: number;
  errors: number;
}

export async function jobProcessAlerts(): Promise<JobResult> {
  const result: JobResult = {
    job: 'process-alerts',
    startedAt: new Date(),
    status: 'success',
    alertsChecked: 0,
    alertsTriggered: 0,
    errors: 0,
  };

  try {
    const { checked, triggered } = await processAlerts();
    result.alertsChecked = checked;
    result.alertsTriggered = triggered;
  } catch (err) {
    result.status = 'error';
    result.errors++;
    console.error('[process-alerts]', err);
  }

  result.finishedAt = new Date();
  const duration =
    (result.finishedAt.getTime() - result.startedAt.getTime()) / 1000;

  console.log(
    `[${result.job}] status=${result.status} ` +
    `duration=${duration}s ` +
    `alerts_checked=${result.alertsChecked} ` +
    `alerts_triggered=${result.alertsTriggered} ` +
    `errors=${result.errors}`,
  );

  return result;
}
