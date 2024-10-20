"use client";
import { Typography } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { useEffect, useState } from "react";
import axios from "axios";
import { styled } from "@mui/material";
// import { Padding } from "@mui/icons-material";

const DivWrapper = styled("div")(() => ({
  display: "flex",
  gap: "15px",
  marginBottom: "15px",
}));

const ImageWrapper = styled("div")(() => ({
  "&:hover": {
    cursor: "pointer", // Optional, to change the cursor on hover
    margin: "2px",
  },
}));

const NextTaskPage = () => {
  const [loader, setLoader] = useState(false);
  const [submission, setSubmission] = useState(false);

  const [status, setStatusText] = useState("");
  const [nextTask, setNextTask] = useState(null);

  const handleImageClick = async (e: any, option: any) => {
    if (submission) return;
    setSubmission(true);

    try {
      const dataIp = {
        task_id: option.task_id,
        selection: option.id,
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_DOMAIN}/v1/workers/submission`,
        dataIp,
        {
          headers: {
            "Content-Type": "application/json",
            // Remove Authorization if it's not needed
            Authorization: sessionStorage.getItem("token") || "",
          },
        }
      );

      console.log(response, "NECRT SUBMIT");

      if (response.status === 201) {
        getNextTask();
      }
    } catch (e) {
      console.log("errr", e);
    } finally {
      setSubmission(false);
    }
  };

  const getNextTask = async () => {
    setLoader(true);

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_DOMAIN}/v1/workers/next-task`,
        {
          headers: {
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );

      // No Tasks
      if (response.status == 411) {
        setStatusText("No more tasks");
        setNextTask(null);
      }

      if (response.status === 200) {
        setNextTask(response.data);
      } else {
        setStatusText("No more tasks");
        setNextTask(null);
      }

      console.log(response, "** RESP ***");
    } catch (e) {
        setStatusText("No more tasks");
      console.log("Error", e);
      setNextTask(null);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getNextTask();
  }, []);


  console.log(status, "SDFadsf");

  return (
    <PageContainer title="Next Task Submission" description="">
      <DashboardCard title="Next Task Submission">
        <>
          <hr />
          <br />
          <Typography>{status ? status : ""} </Typography>
          <Typography variant="h4">{loader ? "Loading..." : ""} </Typography>

          <>
            <Typography variant="h6">
              {
                //@ts-ignore
                nextTask?.title
              }{" "}
            </Typography>
            <br />
            <DivWrapper>
              {nextTask &&
                //@ts-ignore
                nextTask.map((option) => {
                  return (
                    <ImageWrapper key={option.id}>
                      <img
                        src={`${option.imageUrl}`}
                        key={option.id}
                        width={"300"}
                        height={"300"}
                        onClick={(e) => handleImageClick(e, option)}
                      />
                    </ImageWrapper>
                  );
                })}
            </DivWrapper>

            <br />
            <br />

            <Typography variant="h5">
              {submission ? "Submitting" : ""}{" "}
            </Typography>
          </>
        </>
      </DashboardCard>
    </PageContainer>
  );
};

export default NextTaskPage;
