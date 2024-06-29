"use client";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { BACKEND_URL } from "@/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
export default function Appbar() {
  const { publicKey, signMessage } = useWallet();
  const [balance, setBalance] = useState(0);
  async function signAndSend() {
    if (!publicKey) {
      return;
    }
    const message = new TextEncoder().encode(
      "Sign into LabelChain as a worker"
    );

    const signature = await signMessage?.(message);
    if (!signature) {
      console.error("Failed to obtain a valid signature.");
      return;
    }
    console.log("Signature:", signature);
    const response = await axios.post(`${BACKEND_URL}/v1/workers/signin`, {
      signature: Array.from(signature),
      publicKey: publicKey?.toString(),
    });
    setBalance(response.data.amount / 10000);
    localStorage.setItem("token", response.data.token);
    
  }

  useEffect(() => {
    signAndSend();
  }, [publicKey]);

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
          <span className="text-xl font-semibold font-mono text-green-300">
            LabelChain(Workers)
          </span>
        </div>
        <div className="flex">
          <Button
            onClick={() => {
              axios.post(
                `${BACKEND_URL}/v1/workers/payouts`,
                {},
                {
                  headers: {
                    Authorization: localStorage.getItem("token"),
                  },
                }
              );
            }}
            className="px-4 py-6 text-md mr-2 rounded-md font-sans bg-slate-900 text-white hover:bg-slate-950 font-bold"
          >
            Payout :
            <span className=" ml-2 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
              ({balance}) SOL
            </span>
          </Button>
          {publicKey ? <WalletDisconnectButton /> : <WalletMultiButton />}
        </div>
      </header>
      <div className="flex flex-col items-center justify-center space-y-4 py-12  bg-gray-900 text-gray-50">
        <h1 className="text-6xl font-bold font-mono mb-5 text-green-300 text-center">
          Welcome to the LabelChain <br /> Worker Dashboard!
        </h1>
        <p className="max-w-xl text-center text-gray-400 font-mono">
          LabelChain helps you label data quickly and accurately. As a valued
          worker on our platform, your task is to select the most appropriate
          thumbnail from a set of multiple tasks.
        </p>
      </div>
    </div>
  );
}
