/**
 * Store Connector Registry
 *
 * Mapa domain → connector. O JOB-001 usa getConnector(store.domain)
 * para resolver qual connector usar sem lógica condicional espalhada.
 *
 * Para adicionar uma nova loja:
 *   1. Criar worker/src/stores/<loja>.ts implementando StoreConnector
 *   2. Importar e adicionar ao REGISTRY abaixo (uma linha)
 */

import { BelezaNaWebConnector } from './beleza-na-web.ts';
import type { StoreConnector } from './types.ts';

const REGISTRY: ReadonlyMap<string, StoreConnector> = new Map([
  [BelezaNaWebConnector.domain, BelezaNaWebConnector],
]);

/**
 * Retorna o connector registrado para o domínio informado.
 * Retorna null quando nenhum connector está disponível para o domínio.
 *
 * @param domain — domínio sem protocolo (ex: 'belezanaweb.com.br')
 */
export function getConnector(domain: string): StoreConnector | null {
  return REGISTRY.get(domain) ?? null;
}
