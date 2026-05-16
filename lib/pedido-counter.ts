import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
export { formatPedidoNumero } from "@/lib/pedido-format";

interface PedidoCounterFile {
  ultimoNumero: number;
}

function getCounterPath() {
  if (process.env.PEDIDO_COUNTER_FILE) {
    return process.env.PEDIDO_COUNTER_FILE;
  }

  if (process.env.NODE_ENV === "test" || process.env.VITEST) {
    return join(tmpdir(), "giardino-pedido-counter-test.json");
  }

  return join(process.cwd(), "data", "pedido-counter.json");
}

async function readCounter(path: string): Promise<PedidoCounterFile> {
  try {
    const content = await readFile(path, "utf-8");
    const parsed = JSON.parse(content) as Partial<PedidoCounterFile>;
    return { ultimoNumero: Number(parsed.ultimoNumero) || 0 };
  } catch {
    return { ultimoNumero: 0 };
  }
}

export async function getNextPedidoNumero() {
  const counterPath = getCounterPath();
  const counter = await readCounter(counterPath);
  const nextNumber = counter.ultimoNumero + 1;

  await mkdir(dirname(counterPath), { recursive: true });
  await writeFile(counterPath, JSON.stringify({ ultimoNumero: nextNumber }, null, 2), "utf-8");

  return nextNumber;
}
