"use client";
import React, { useEffect } from "react";
import { Box, AppBar, Toolbar, styled, Stack } from "@mui/material";
import PropTypes from "prop-types";
import Alert from "@mui/material/Alert";

import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { useRouter } from "next/navigation";


interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  const { publicKey, signMessage, disconnect } = useWallet();
  const { disconnecting, connected, wallet, connecting } = useWallet();
  const router = useRouter(); // Initialize the useRouter hook



  useEffect(() => {
    if (!connecting && !connected && !wallet) {
      // Callback after wallet has been disconnected
      console.log("Wallet has been disconnected");
      sessionStorage.removeItem("token");


      // Add your redirection logic here
      // Example: window.location.href = '/login';
      router.push("/authentication/login");
    }
  }, [connected, wallet]);

  //   try {
  //     if (!publicKey) throw new Error("Wallet not connected!");
  //     // if (!signMessage)
  //     //   throw new Error("Wallet does not support message signing!");

  //     const message = new TextEncoder().encode(
  //       `brodify wants you to sign in with your Solana account. Please sign in.`
  //     );
  //     const signature = await signMessage?.(message);


  //     const url = `${process.env.NEXT_PUBLIC_DOMAIN}/v1/users/signin`;


  //     console.log(url, "**** URL");



  //     const resp = await axios.post(url, {
  //       signature,
  //       publicKey: publicKey?.toString(),
  //     });

  //     sessionStorage.setItem("token", resp.data.token);
  //   } catch (error: any) {
  //     // notify("error", `Sign Message failed: ${error?.message}`);
  //     console.log("Something went wrong", error);
  //     disconnect();
  //   }
  // };

  // useEffect(() => {
  //   if (publicKey) {
  //     console.log(publicKey, "**** Testing ***");

  //     signMsgSend();
  //   }
  // }, [publicKey]);

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: {
      minHeight: "70px",
    },
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          {/* <Button color="primary" size="medium"> */}
          {/* <strong>Connect Wallet</strong> */}

          {!publicKey ? (
            <Alert severity="warning">Please connect to wallet.</Alert>
          ) : (
            ""
          )}
          {!publicKey ? <WalletMultiButton /> : <WalletDisconnectButton style={{
            width: '100%',            // Full width
            backgroundColor: '#5D87FF', // Material UI primary color
            color: '#fff',            // White text
            padding: '12px 24px',     // Button padding
            fontSize: '16px',         // Font size
            textAlign: 'center',      // Center the text
            borderRadius: '4px',      // Border radius
            display: 'flex',          // Flexbox for proper alignment
            justifyContent: 'center', // Center the content horizontally
            alignItems: 'center'      // Center the content vertically
          }} />}
          {/* </Button> */}
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;
