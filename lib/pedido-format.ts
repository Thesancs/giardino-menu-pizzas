export function formatPedidoNumero(numero: number) {
  return String(numero).padStart(3, "0");
}
