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

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  const { publicKey, signMessage, disconnect } = useWallet();

  const signMsgSend = async () => {
    try {
      if (!publicKey) throw new Error("Wallet not connected!");
      // if (!signMessage)
      //   throw new Error("Wallet does not support message signing!");

      const message = new TextEncoder().encode(
        `brodify wants you to sign in with your Solana account. Please sign in.`
      );
      const signature = await signMessage?.(message);


      const url = `${process.env.NEXT_PUBLIC_DOMAIN}/v1/users/signin`;



      const resp = await axios.post(url, {
        signature,
        publicKey: publicKey?.toString(),
      });

      localStorage.setItem("token", resp.data.token);
    } catch (error: any) {
      // notify("error", `Sign Message failed: ${error?.message}`);
      console.log("Something went wrong", error);
      disconnect();
    }
  };

  useEffect(() => {
    if (publicKey) {
      console.log(publicKey, "**** Testing ***");

      signMsgSend();
    }
  }, [publicKey]);

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

          {!publicKey ? <WalletMultiButton /> : <WalletDisconnectButton />}
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
