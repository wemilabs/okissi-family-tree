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

// import Link from "next/link";
// import { Logo } from "./logo";
// import { ModeToggle } from "./mode-toggle";
// import { Badge } from "./ui/badge";
// import { getFamilyData } from "@/lib/family-actions";

// export const Header = async () => {
//   const familyData = await getFamilyData();
//   const totalMembers = familyData.persons.length;

//   return (
//     <header className="flex items-center justify-between">
//       <Logo />
//       <div className="relative flex items-center">
//         <Link href="/tree" className="font-medium hover:underline">
//           Voir l'arbre
//         </Link>
//         <Badge variant="secondary" className="absolute -top-2 -right-8 text-xs">
//           {totalMembers}
//         </Badge>
//       </div>
//       <ModeToggle />
//     </header>
//   );
// };
