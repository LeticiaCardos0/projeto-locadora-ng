// Utilitários de validação compartilhados entre os CRUDs do painel admin.

/** Ano mínimo aceito em qualquer campo de data do sistema. */
export const ANO_MINIMO = 2025;
export const DATA_MINIMA = `${ANO_MINIMO}-01-01`;

/**
 * Regex que cobre a grande maioria dos emojis (símbolos, pictogramas,
 * transporte, bandeiras, dingbats, variation selectors, etc).
 */
const EMOJI_REGEX =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/u;

/** Retorna true se o texto contiver emoji. */
export function contemEmoji(texto: string | null | undefined): boolean {
  if (!texto) return false;
  return EMOJI_REGEX.test(texto);
}

/** Remove emojis de uma string, mantendo o restante do texto intacto. */
export function removerEmoji(texto: string | null | undefined): string {
  if (!texto) return '';
  return texto.replace(EMOJI_REGEX, '');
}

/** Handler de (keydown) para bloquear a digitação de emojis em tempo real. */
export function bloquearEmojiKeydown(event: KeyboardEvent): void {
  if (event.key && contemEmoji(event.key)) {
    event.preventDefault();
  }
}

/** Verifica se um valor numérico é válido e não-negativo (>= 0). */
export function valorValido(valor: number | null | undefined): boolean {
  return valor !== null && valor !== undefined && !isNaN(valor) && valor >= 0;
}

/** Verifica se uma data (string 'yyyy-MM-dd') é >= 2025-01-01. */
export function dataValida(data: string | null | undefined): boolean {
  if (!data) return false;
  return data >= DATA_MINIMA;
}

/** Verifica se um campo de texto obrigatório foi preenchido (ignora espaços). */
export function campoPreenchido(valor: string | null | undefined): boolean {
  return !!valor && valor.trim().length > 0;
}

/**
 * Formata uma data armazenada como 'yyyy-MM-dd' (ou ISO completo) para 'dd/MM/yyyy'.
 * Retorna '-' se a data for inválida/vazia, para exibição segura em tabelas.
 */
export function formatarDataBr(data: string | null | undefined): string {
  if (!data) return '-';
  const somenteData = data.substring(0, 10); // corta hora, se houver
  const partes = somenteData.split('-');
  if (partes.length !== 3) return '-';
  const [ano, mes, dia] = partes;
  if (!ano || !mes || !dia) return '-';
  return `${dia}/${mes}/${ano}`;
}

/**
 * Gera o próximo ID sequencial e legível para uma lista (ex: 'V0001', 'V0002'...),
 * em vez de usar timestamps crus. Olha o maior número já usado com o prefixo
 * informado e incrementa, então funciona mesmo após exclusões.
 */
export function gerarProximoId(prefixo: string, idsExistentes: string[]): string {
  let maior = 0;
  for (const id of idsExistentes) {
    const match = id.match(new RegExp(`^${prefixo}(\\d+)$`));
    if (match) {
      const numero = parseInt(match[1], 10);
      if (numero > maior) maior = numero;
    }
  }
  const proximo = maior + 1;
  return `${prefixo}${proximo.toString().padStart(4, '0')}`;
}
