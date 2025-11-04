import Link from "next/link";
import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";

export const Header = () => (
  <header className="flex items-center justify-between">
    <Logo />
    <Link href="/tree" className="font-medium hover:underline">
      Voir l'arbre
    </Link>
    <ModeToggle />
  </header>
);
