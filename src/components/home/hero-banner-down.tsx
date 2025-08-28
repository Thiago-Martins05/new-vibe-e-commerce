"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const HeroBannerDown = () => {
  const router = useRouter();

  const handleNavigateToJackets = () => {
    router.push("/category/jaquetas-moletons");
  };

  return (
    <div className="my-5 space-y-6">
      <div className="px-5">
        <Image
          src="/banner02.png"
          alt="Seja auténtico."
          width={0}
          height={0}
          sizes="80vw"
          className="w-full hover-zoom cursor-pointer md:hidden"
          onClick={handleNavigateToJackets}
        />
      </div>
      <Image
        src="/hero2desktop.png"
        alt="Seja auténtico."
        width={0}
        height={0}
        sizes="80vw"
        className="hidden rounded-3xl hover-zoom cursor-pointer md:m-auto md:block md:w-[78%]"
        onClick={handleNavigateToJackets}
      />
    </div>
  );
};

export default HeroBannerDown;
