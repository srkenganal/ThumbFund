import React from "react";
import {
  Box,
} from "@mui/material";

import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";


interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
  publicKey?: any;
}



const AuthLogin = ({ title, subtitle, subtext, publicKey }: loginType) => (
  <>

    {subtext}

    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ width: '100%' }} // Ensures full width container
    >
      {!publicKey ? (
        <WalletMultiButton
          style={{
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
          }}
        />
      ) : (
        <WalletDisconnectButton
          style={{
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
          }}
        />
      )}
    </Box>
    {subtitle}
  </>
);

export default AuthLogin;
