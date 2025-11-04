import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/">
      <Image
        src="/okissi.png"
        alt="OKISSI"
        width={33}
        height={33}
        className="rounded-md"
      />
    </Link>
  );
};
