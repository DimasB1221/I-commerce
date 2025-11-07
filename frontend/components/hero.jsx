import Image from "next/image";
import { AuroraBackground } from '@/components/ui/shadcn-io/aurora-background';
import CornerButton from "@/components/cornerButton"

export default function Hero() {
  return (
   <AuroraBackground>
    <div className="relative flex flex-col gap-4 items-center justify-center px-4 h-[100px]">
       <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Left Content */}
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Introducing the Future
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Experience cutting-edge performance, stunning design, and powerful innovation.
          </p>
          <CornerButton />
        </div>

        {/* Right Image */}
        <Image
          src="/iPhone15.png"
          alt="iPhone Product"
          className="w-[360px] md:w-[400px] drop-shadow-2xl hidden md:block "
          width={500}
          height={500}
        />
      </div>
      
    </div>
  </AuroraBackground>
    
  );
}

<section className="relative bg-gradient-to-b from-white to-sky-100 min-h-[90vh] flex items-center">
     
    </section>