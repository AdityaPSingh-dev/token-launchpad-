"use client";

import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletModalProvider,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";
import { TokenLaunchpad } from "./TokenLaunchpad";

function App() {
  return (
    <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <div className="h-96 flex flex-col justify-between items-center bg-gray-100">
            {/* Token Mint UI */}
            <TokenLaunchpad />

            {/* Wallet Buttons at Bottom */}
            <div className="w-full flex justify-center pb-6 ">
              <WalletMultiButton />
              <WalletDisconnectButton />
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
