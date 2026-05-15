import { CardapioShell } from "@/components/cardapio/CardapioShell";
import { demoRestaurante } from "@/data/demo-restaurante";

export default function DemoPage() {
  return <CardapioShell restaurante={demoRestaurante} />;
}
