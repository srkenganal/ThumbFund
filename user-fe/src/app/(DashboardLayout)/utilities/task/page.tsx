"use client";
import Link from "next/link";
import {
  CardContent,
  Typography,
  Grid,
  Rating,
  Tooltip,
  Fab,
  Avatar,
} from "@mui/material";

import { Stack } from "@mui/system";
import { IconBasket } from "@tabler/icons-react";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import axios from "axios";


const TaskItemPage = () => {
  const [task, setTask] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [loader, serLoader] = useState(false);

  const router = useRouter();
  // const { id } = router.query;
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const getTask = async () => {
    serLoader(true);
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_DOMAIN}/v1/users/task/${id}`,
      {
        headers: {
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );

    setTaskTitle(response.data.taskTitle);
    //@ts-ignore
    let result = [];
    Object.keys(response.data.submissionRes).forEach((key) => {
      result.push({
        photo: response.data.submissionRes[key].option.imageUrl,
        price: response.data.submissionRes[key].count,
        title: "Total Submission",
      });
    });
    //@ts-ignore
    setTask(result);
    serLoader(false);

    // return response;
  };

  useEffect(() => {
    getTask();
  }, [id]);

  return (
    <Grid container spacing={3}>

      <Grid item xs={12} md={12} lg={12}>
        <Typography variant="h4">{loader ? "Loading..." : ''}</Typography>
      </Grid>



      <Grid item xs={12} md={12} lg={12}>
        <Typography variant="h4">{taskTitle}</Typography>
      </Grid>
      {
        //@ts-ignore
        task.length
          ? task.map((product, index) => (
            <Grid item xs={12} md={4} lg={3} key={index}>
              <BlankCard>
                <Typography component={Link} href="/">
                  <Avatar
                    src={
                      //@ts-ignore
                      product.photo
                    }
                    variant="square"
                    sx={{
                      height: 250,
                      width: "100%",
                    }}
                  />
                </Typography>

                <CardContent sx={{ p: 3, pt: 2 }}>
                  <Typography variant="h6">
                    {
                      //@ts-ignore
                      product.title
                    }
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mt={1}
                  >
                    <Stack direction="row" alignItems="center">
                      <Typography variant="h6">
                        {
                          //@ts-ignore
                          product.price
                        }
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </BlankCard>
            </Grid>
          ))
          : ""
      }
    </Grid>
  );
};

export default TaskItemPage;
