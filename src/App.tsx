"use client";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";
import { TokenLaunchpad } from "./TokenLaunchpad";
function App() {

  return (
    <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <div>
          <WalletMultiButton/>
          <WalletDisconnectButton/>
          </div>
          <TokenLaunchpad></TokenLaunchpad>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App
