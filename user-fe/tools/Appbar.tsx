import { Button } from "@/components/ui/button";
import { JSX, SVGProps } from "react";
import Image from "next/image";
export default function Appbar() {
  return (
    <div>
      <header className="flex items-center justify-between px-4 py-3 bg-gray-800 text-gray-50 shadow-md">
        <div className="flex items-center gap-2">
        <Image
            src="/logo.jpeg"
            alt="LabelChain Logo"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span className="text-xl font-semibold font-mono text-green-300">LabelChain</span>
        </div>
        <Button className="px-4 py-2 rounded-md text-sm font-semibold font-mono bg-green-700 text-[#1E1E1E] hover:bg-[#80d080]">
          Connect Wallet
        </Button>
      </header>
      <div className="flex flex-col items-center justify-center space-y-4 py-12 bg-gray-900 text-gray-50">
        <h1 className="text-6xl font-bold font-mono mb-5 text-green-300">Welcome to LabelChain!</h1>
        <p className="max-w-xl text-center text-gray-400 font-mono">
        LabelChain helps you label data quickly and accurately. Our easy-to-use platform makes data preparation effortless, saving you time and improving your results. Get started with LabelChain for better data labeling today.
        </p>
      </div>
    </div>
  );
}

