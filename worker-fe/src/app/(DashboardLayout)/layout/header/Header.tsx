"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,
  Button,
} from "@mui/material";
import PropTypes from "prop-types";
import Link from "next/link";
// components
import Profile from "./Profile";
import { IconBellRinging, IconMenu } from "@tabler/icons-react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  const { connection } = useConnection();
  const { publicKey, signMessage, disconnect } = useWallet();
  const [balance, setBalance] = useState(0);

  // const getBalance = async () => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:3008/v1/workers/balance`,
  //       {
  //         headers: {
  //           Authorization: localStorage.getItem("token"),
  //         },
  //       }
  //     );

  //     if (response.status === 200) {
  //       setBalance(response.data?.pending_bal);
  //     } else {
  //       setBalance(0);
  //     }
  //   } catch (e) {
  //     console.log("Error", e);
  //     setBalance(0);
  //   } finally {
  //   }
  // };

  useEffect(() => {}, []);
  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  // const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const signMsgSend = async () => {
    try {
      if (!publicKey) throw new Error("Wallet not connected!");
      // if (!signMessage)
      //   throw new Error("Wallet does not support message signing!");

      const message = new TextEncoder().encode(
        `workify wants you to sign in with your Solana account. Please sign in.`
      );
      const signature = await signMessage?.(message);

      console.log("Signature:", signature);

      const resp = await axios.post(`${process.env.NEXT_PUBLIC_DOMAIN}/v1/workers/signin`, {
        signature,
        publicKey: publicKey?.toString(),
      });

      localStorage.setItem("token", resp.data.token);
      setBalance(resp.data.pending_bal);
    } catch (error: any) {
      // notify("error", `Sign Message failed: ${error?.message}`);
      console.log("Something went wrong", error);
      setBalance(0);
      disconnect();
    }
  };

  // useEffect(() => {
  //   getBalance();
  // }, [])
  useEffect(() => {
    if (publicKey) {
      signMsgSend();
    }
  }, [publicKey]);

  const handlePayout = async () => {
    try {
      const resp = await axios.post(`${process.env.NEXT_PUBLIC_DOMAIN}/v1/workers/payout`, {}, {
        headers: {
          "Authorization": localStorage.getItem("token")
        }
      });

      console.log(resp.data, "DATA")
    } catch (error: any) {
      // notify("error", `Sign Message failed: ${error?.message}`);
      console.log("Something went wrong", error);
    }
  }

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
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline",
            },
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        <IconButton
          size="large"
          aria-label="show 11 new notifications"
          color="inherit"
          aria-controls="msgs-menu"
          aria-haspopup="true"
        >
          <Badge variant="dot" color="primary">
            <IconBellRinging size="21" stroke="1.5" />
          </Badge>
        </IconButton>
        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          {/* <Button color="primary" size="medium"> */}
          {/* <strong>Connect Wallet</strong> */}

          <Button onClick={handlePayout} color="primary" size="small" variant="contained">
            Pay out ({balance / 1_000_000_000}) Sol
          </Button>

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
