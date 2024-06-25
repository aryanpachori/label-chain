import { Button } from "@/components/ui/button";
import { JSX, SVGProps } from "react";
import Image from "next/image";
export default function Appbar() {
  return (
    <div>
      <header className="flex items-center justify-between px-4 py-3 bg-gray-800 text-gray-50 shadow-md font-sans">
        <div className="flex items-center gap-2">
        <Image
            src="/logo.jpeg"
            alt="LabelChain Logo"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span className="text-xl font-semibold font-mono text-green-300">LabelChain(Workers)</span>
        </div>
        <Button className="px-4 py-2 rounded-md text-sm font-semibold font-mono bg-green-700 text-[#1E1E1E] hover:bg-[#80d080]">
          Connect Wallet
        </Button>
      </header>
      <div className="flex flex-col items-center justify-center space-y-4 py-12  bg-gray-900 text-gray-50">
        <h1 className="text-6xl font-bold font-mono mb-5 text-green-300 text-center">Welcome to the LabelChain <br/> Worker Dashboard!</h1>
        <p className="max-w-xl text-center text-gray-400 font-mono">
        LabelChain helps you label data quickly and accurately. As a valued worker on our platform, your task is to select the most appropriate thumbnail from a set of multiple tasks.
        </p>
      </div>
    </div>
  );
}

function MountainIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
