import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className = "", size = "md" }: LogoProps) => {

  const sizeMap = {
    sm: 40, 
    md: 56, 
    lg: 80
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const logoUrl =
    "https://i.postimg.cc/N0m5JztY/Gemini-Generated-Image-z70l4xz70l4xz70l-removebg-preview.png";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src={logoUrl}
        alt="Paryatak Suraksha Logo"
        width={sizeMap[size]}
        height={sizeMap[size]}
        className="object-contain"
        priority
      />

      <span
        className={`font-bold ${textSizes[size]} bg-[linear-gradient(to_right,#703110,#D97000,#FFAA21)] bg-clip-text text-transparent`}
      >
        Paryatak Suraksha
      </span>
    </div>
  );
};

export default Logo;
