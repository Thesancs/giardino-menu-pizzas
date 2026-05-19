import { CardapioShell } from "@/components/cardapio/CardapioShell";
import { demoRestaurante } from "@/data/demo-restaurante";

export default function MenuPage() {
  return <CardapioShell restaurante={demoRestaurante} />;
}
