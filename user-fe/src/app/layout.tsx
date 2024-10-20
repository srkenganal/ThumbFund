"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import React, { useEffect, FC, useMemo } from "react";
import { useRouter } from "next/navigation"; // Import useRouter



// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

// const MainWrapper = styled("div")(() => ({
//   display: "flex",
//   minHeight: "100vh",
//   width: "100%",
// }));

// const PageWrapper = styled("div")(() => ({
//   display: "flex",
//   flexGrow: 1,
//   paddingBottom: "60px",
//   flexDirection: "column",
//   zIndex: 1,
//   backgroundColor: "transparent",
// }));

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  const router = useRouter();


  useEffect(() => {
    // Check if the user is logged in by checking the token in sessionStorage
    const token = sessionStorage.getItem("token");
    if (token) {
      // If the user is logged in, redirect to the home page
      router.push("/");
    } else {
      // If no token is found, redirect to the login page
      router.push("/authentication/login");
    }
  }, [router]);


  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      /**
       * Wallets that implement either of these standards will be available automatically.
       *
       *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
       *     (https://github.com/solana-mobile/mobile-wallet-adapter)
       *   - Solana Wallet Standard
       *     (https://github.com/anza-xyz/wallet-standard)
       *
       * If you wish to support a wallet that supports neither of those standards,
       * instantiate its legacy wallet adapter here. Common legacy adapters can be found
       * in the npm package `@solana/wallet-adapter-wallets`.
       */
      // new UnsafeBurnerWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );


  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={baselightTheme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                {children}
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
