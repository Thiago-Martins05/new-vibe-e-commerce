"use client";
import Image from "next/image";

const logos = [
  { src: "/adidas-logo.png", alt: "Adidas" },
  { src: "/nike-logo.png", alt: "Nike" },
  { src: "/puma-logo.png", alt: "Puma" },
  { src: "/newbalance-logo.png", alt: "New Balance" },
  { src: "/converse-logo.png", alt: "Converse" },
  { src: "/polo-logo.png", alt: "Polo" },
  { src: "/zara-logo.png", alt: "Zara" },
];

const PartnerBrands = ({ title }: { title: string }) => {
  return (
    <div className="space-y-6 px-3 md:m-auto md:w-[80%]">
      <h3 className="px-6 font-semibold">{title}</h3>

      <div className="group relative flex w-full gap-3 overflow-x-auto px-3 [&::-webkit-scrollbar]:hidden">
        <div className="group relative overflow-hidden">
          <div className="animate-scroll flex w-max gap-5">
            {logos.concat(logos).map((logo, i) => (
              <Image
                key={i}
                src={logo.src}
                alt={logo.alt}
                width={100}
                height={150}
                className="md:h-auto md:w-[100px]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerBrands;
