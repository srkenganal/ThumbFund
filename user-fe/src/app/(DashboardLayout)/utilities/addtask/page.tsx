"use client";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useState } from "react";
import axios from "axios";
import { styled } from "@mui/material";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { TransactionSignature } from "@solana/web3.js";
import {
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

import {
  Grid,
  Card,
  CardContent,
  Button,
  Typography,
  TextField,
  Divider,
} from "@mui/material";


const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const DivWrapper = styled("div")(() => ({
  display: "flex",
  gap: "15px",
  marginBottom: "15px",
  marginTop: "5px",
}));

const StyledButton = styled(Button)`
  margin-top: 16px;
`;

const AddTaskPage = () => {
  const [images, setImage] = useState([]);
  const [title, setTitle] = useState("");
  const [uploading, setUpLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [txtSignature, setTxtSignature] = useState("");

  //   const [presignedData, setPresignedData] = useState(null);
  const [status, setStatus] = useState("");
  const [data, setData] = useState([]);

  const getPresignedUrl = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_DOMAIN}/v1/users/presigned-url`,
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    // setPresignedData(response.data);
    return response;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);

    let dataIp = {
      title,
      options: data,
      signature: txtSignature,
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_DOMAIN}/v1/users/task`,
        dataIp,
        {
          headers: {
            "Content-Type": "application/json",
            // Remove Authorization if it's not needed
            Authorization: localStorage.getItem("token") || "",
          },
        }
      );

      if (response.statusText == "OK") {
        setImage([]);
        setTitle("");
        setData([]);
        console.log("ALL GOOD", response); // Optionally log the response data for more insight
      }
    } catch (error) {
      console.error("Error making request", error);
      // Optionally handle specific errors based on error.response or error.message
    } finally {
      setSubmitting(false);
    }
    // let formData = new FormData();
    // formData.append("file", image.data);

    // const formData = new FormData();
    // //@ts-ignore
    // Object.entries(presignedData?.fields || {}).forEach(([key, value]) => {
    //   //@ts-ignore
    //   formData.append(key, value);
    // });
    // formData.append("file", image.data);

    // //@ts-ignore
    // const response = await axios.post(presignedData?.url, formData, {
    //   headers: {
    //     // Note: You usually don't need an Authorization header for a pre-signed URL
    //     "Content-Type": "multipart/form-data",
    //   },
    // });

    // if (response) setStatus(response.statusText);
  };

  const handleChange = (e: any) => {
    setTitle(e.target.value);
  };

  const handleFileChange = async (e: any) => {
    setUpLoading(true);
    setStatus("Uploading...");
    const img = {
      preview: URL.createObjectURL(e.target.files[0]),
      //   data: e.target.files[0],
    };

    let imgs = [...images];

    // @ts-ignore
    imgs.push(img);
    setImage(imgs);

    // @ts-ignore
    let dataSoure = [...data];

    let presignedResp = await getPresignedUrl();

    if (presignedResp) {
      // e.preventDefault();
      // let formData = new FormData();
      // formData.append("file", image.data);

      const formData = new FormData();
      //@ts-ignore
      Object.entries(presignedResp?.data?.fields || {}).forEach(
        ([key, value]) => {
          //@ts-ignore
          formData.append(key, value);

          if (key === "key") {
            // @ts-ignore
            dataSoure.push({
              image_url: value,
            });

            //@ts-ignore
            setData(dataSoure);
          }
        }
      );
      formData.append("file", e.target.files[0]);


      //@ts-ignore
      const response = await axios.post(presignedResp?.data?.url, formData, {
        headers: {
          // Note: You usually don't need an Authorization header for a pre-signed URL
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 204) {
        // @ts-ignore
        setStatus("Success");
        setUpLoading(false);
      }
    }
  };

  const makePayment = async (e: any) => {
    e.preventDefault();
    let signature: TransactionSignature | undefined = undefined;
    if (!publicKey) throw new Error("Wallet not connected!");

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey("Fqq8GXD3x9bMdUzKEJzQqi48LC9pC4q9FxmM2ZLBjh5e"),
        lamports: 100000000,
      })
    );

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    signature = await sendTransaction(transaction, connection, {
      minContextSlot,
    });

    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    });

    setTxtSignature(signature);
  };

  return (
    <PageContainer>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Add Tasks
              </Typography>
              <Divider />
              <DivWrapper>
                {images.map((image) => (
                  <img
                    // @ts-ignore
                    key={image?.preview}
                    // @ts-ignore

                    src={image?.preview}
                    alt="Preview"
                    width="200"
                    height="300"
                    style={{ borderRadius: "8px" }}
                  />
                ))}
              </DivWrapper>

              <form onSubmit={txtSignature ? handleSubmit : makePayment}>
                <TextField
                  label="Title"
                  name="title"
                  variant="outlined"
                  fullWidth
                  value={title}
                  onChange={handleChange}
                  margin="normal"
                />
                <input
                  type="file"
                  name="file"
                  onChange={handleFileChange}
                  style={{ marginBottom: "16px" }}
                />
                <StyledButton
                  type="submit"
                  className="primary"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                  fullWidth
                >
                  {submitting
                    ? "Loading ..."
                    : txtSignature
                    ? "Submit"
                    : "Pay 0.1 Sol"}
                </StyledButton>
              </form>

              {status && (
                <Typography
                  variant="body1"
                  color="textSecondary"
                  style={{ marginTop: "16px" }}
                >
                  {status}
                </Typography>
              )}
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default AddTaskPage;
