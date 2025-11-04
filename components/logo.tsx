import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/">
      <Image
        src="https://ubrw5iu3hw.ufs.sh/f/TFsxjrtdWsEI2nMSS96OWeVvZR7TyuB8q0wYA9LGpXglijMJ"
        alt="OKISSI"
        width={33}
        height={33}
        className="rounded-md"
      />
    </Link>
  );
};
