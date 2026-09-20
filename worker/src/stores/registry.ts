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
import { MercadoLivreConnector } from './mercado-livre.ts';
import { RennerConnector } from './renner.ts';
import { HeringConnector } from './hering.ts';
import { CeaConnector } from './cea.ts';
import { BoticarioConnector } from './boticario.ts';
import { NaturaConnector } from './natura.ts';
import { DafitiConnector } from './dafiti.ts';
import { NetshoesConnector } from './netshoes.ts';
import { DemocrataConnector } from './democrata.ts';
import { FerraciniConnector } from './ferracini.ts';
import { AmazonConnector } from './amazon.ts';
import type { StoreConnector } from './types.ts';

const REGISTRY: ReadonlyMap<string, StoreConnector> = new Map([
  [BelezaNaWebConnector.domain, BelezaNaWebConnector],
  [MercadoLivreConnector.domain, MercadoLivreConnector],
  ['produto.mercadolivre.com.br', MercadoLivreConnector],
  [AmazonConnector.domain, AmazonConnector],
  [RennerConnector.domain, RennerConnector],
  [HeringConnector.domain, HeringConnector],
  [CeaConnector.domain, CeaConnector],
  [BoticarioConnector.domain, BoticarioConnector],
  [NaturaConnector.domain, NaturaConnector],
  [DafitiConnector.domain, DafitiConnector],
  [NetshoesConnector.domain, NetshoesConnector],
  [DemocrataConnector.domain, DemocrataConnector],
  [FerraciniConnector.domain, FerraciniConnector],
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
