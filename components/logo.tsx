import Image from "next/image";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-[#07120f]",
        className,
      )}
    >
      <Image
        src="/logo.png"
        alt="PawthCare"
        fill
        sizes="256px"
        quality={100}
        className="scale-[1.7] object-cover"
        priority
      />
    </span>
  );
}
