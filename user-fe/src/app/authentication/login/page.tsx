"use client";
import { Grid, Box, Card, Typography } from "@mui/material";
// components
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import AuthLogin from "../auth/AuthLogin";
import { useRouter } from "next/navigation";

import { useEffect } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";

const Login2 = () => {
  const { publicKey, signMessage, disconnect, connecting, connected } = useWallet();
  const router = useRouter(); // Initialize the useRouter hook


  console.log("**** URL", connecting, connected);


  const signMsgSend = async () => {
    try {
      if (!publicKey) throw new Error("Wallet not connected!");
      // if (!signMessage)
      //   throw new Error("Wallet does not support message signing!");

      const message = new TextEncoder().encode(
        'QuickTask wants you to sign in with your Solana account. Please sign in.'
      );
      const signature = await signMessage?.(message);
      const url = `${process.env.NEXT_PUBLIC_DOMAIN}/v1/users/signin`;

      const resp = await axios.post(url, {
        signature,
        publicKey: publicKey?.toString(),
      });

      sessionStorage.setItem("token", resp.data.token);

      if (resp.data.token) {
        // Redirect to the homepage after successful login
        router.push("/"); // Redirect to home page
      }
    } catch (error: any) {
      // notify("error", `Sign Message failed: ${error?.message}`);
      console.log("Something went wrong", error);
      disconnect();
    }
  };

  useEffect(() => {
    if (publicKey) {
      signMsgSend();
    }
  }, [publicKey]);

  return (
    <PageContainer title="Login" description="this is Login page">
      <Box
        sx={{
          position: "relative",
          "&:before": {
            content: '""',
            background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
            backgroundSize: "400% 400%",
            animation: "gradient 15s ease infinite",
            position: "absolute",
            height: "100%",
            width: "100%",
            opacity: "0.3",
          },
        }}
      >
        <Grid
          container
          spacing={0}
          justifyContent="center"
          sx={{ height: "100vh" }}
        >
          <Grid
            item
            xs={12}
            sm={12}
            lg={4}
            xl={3}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Card
              elevation={9}
              sx={{ p: 2, zIndex: 1, width: "100%", maxWidth: "500px" }}
            >
              <Box display="flex" alignItems="center" justifyContent="center">
                {/* <Logo /> */}
                <Typography sx={{ marginBottom: "2px", marginTop: "4px", paddingTop: "12px" }} variant="h2"> <Typography sx={{ fontWeight: "700", display: "inline-block", color: "#5D87FF" }} variant="h2"> Quick</Typography>Task</Typography>

              </Box>
              <AuthLogin
                subtext={
                  <Typography
                    variant="subtitle1"
                    textAlign="center"
                    color="textSecondary"
                    mb={5}
                  >
                    Create, fund, succeed.
                  </Typography>
                }
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};
export default Login2;
