"use client";
import React, { useEffect, useState } from "react";
import { Box, AppBar, Toolbar, styled, Stack, IconButton, Button, Badge } from "@mui/material";
import { IconBellRinging, IconMenu, IconRefresh } from "@tabler/icons-react";

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

  const [balance, setBalance] = useState(0);
  const [payoutProgress, setPayoutProgress] = useState(false);


  const { publicKey, signMessage, disconnect } = useWallet();
  const { disconnecting, connected, wallet, connecting } = useWallet();
  const router = useRouter(); // Initialize the useRouter hook


  const getBalance = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_DOMAIN}/v1/workers/balance`,
        {
          headers: {
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );

      if (response.status === 200) {
        setBalance(response.data?.pending_bal);
      } else {
        setBalance(0);
      }
    } catch (e) {
      console.log("Error", e);
      setBalance(0);
    } finally {
    }
  };

  useEffect(() => {
    getBalance();
  }, [])


  const handlePayout = async () => {
    setPayoutProgress(true);
    try {
      const resp = await axios.post(`${process.env.NEXT_PUBLIC_DOMAIN}/v1/workers/payout`, {}, {
        headers: {
          "Authorization": sessionStorage.getItem("token")
        }
      });
      if (resp.data) {
        getBalance();
      }
    } catch (error: any) {
      // notify("error", `Sign Message failed: ${error?.message}`);
      console.log("Something went wrong", error);
    } finally {
      setPayoutProgress(false);
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

        <Box flexGrow={1} />
        <Stack spacing={3} direction="row" alignItems="center">

          <Button onClick={getBalance} variant="outlined" startIcon={<IconRefresh />}>
            Refresh
          </Button>

          {/* Pay Out Button */}
          <Button onClick={handlePayout} color="primary" size="small" variant="contained" disabled={payoutProgress}>
            {payoutProgress ? "Processing ..." : `Pay out (${balance / 1_000_000_000}) Sol`}
          </Button>

          {/* Display wallet buttons based on wallet connection status */}
          {!publicKey ? (
            <WalletMultiButton />
          ) : (
            <WalletDisconnectButton
              style={{
                width: 'auto',              // Auto width to fit content
                backgroundColor: '#5D87FF', // Primary color
                color: '#fff',              // White text
                padding: '12px 24px',       // Button padding
                fontSize: '16px',           // Font size
                textAlign: 'center',        // Center the text
                borderRadius: '4px',        // Border radius
                display: 'flex',            // Flexbox for alignment
                justifyContent: 'center',   // Center content horizontally
                alignItems: 'center'        // Center content vertically
              }}
            />
          )}
        </Stack>

      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;
