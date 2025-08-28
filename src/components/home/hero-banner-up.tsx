"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const HeroBannerUp = () => {
  const router = useRouter();

  const handleNavigateToJackets = () => {
    router.push("/category/jaquetas-moletons");
  };

  return (
    <div className="mb-5 space-y-6">
      <div className="px-5">
        <Image
          src="/banner01.png"
          alt="Leve uma vida com estilo."
          width={0}
          height={0}
          sizes="80vw"
          className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer md:hidden"
          onClick={handleNavigateToJackets}
        />

        <Image
          src="/hero1desktop.png"
          alt="Leve uma vida com estilo."
          width={0}
          height={0}
          sizes="80vw"
          className="hidden transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer md:m-auto md:block md:w-[80%]"
          onClick={handleNavigateToJackets}
        />
      </div>
    </div>
  );
};

export default HeroBannerUp;
