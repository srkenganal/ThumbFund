"use client";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
} from "@mui/material";
import DashboardCard from "@/app/(DashboardLayout)//components/shared/DashboardCard";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

const TaskPerformance = () => {
  const [tasks, settasks] = useState([]);
  const [loader, setLoader] = useState(false);

  const getTasks = async () => {
    setLoader(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_DOMAIN}/v1/users/task`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      settasks(response.data);
      setLoader(false);
      return response;
    } catch (e) {
      console.log("Error", e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);
  return (
    <DashboardCard title="All Tasks">
      <Box sx={{ overflow: "auto", width: { xs: "280px", sm: "auto" } }}>
        {loader ? (
          <Typography variant="subtitle2" fontWeight={600}>
            Loading ...
          </Typography>
        ) : (
          <Table
            aria-label="simple table"
            sx={{
              whiteSpace: "nowrap",
              mt: 2,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Id
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Title
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Status
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Amout
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Action
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.length ?
                tasks.map((task) => (
                  <TableRow
                    key={
                      //@ts-ignore
                      task.id
                    }
                  >
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: "15px",
                          fontWeight: "500",
                        }}
                      >
                        {
                          //@ts-ignore
                          task.id
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color="textSecondary"
                        variant="subtitle2"
                        fontWeight={400}
                      >
                        {
                          //@ts-ignore
                          task.title
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        sx={{
                          px: "4px",
                          backgroundColor: "#5D87FF",
                          color: "#fff",
                        }}
                        size="small"
                        label={
                          //@ts-ignore
                          task.done ? "Done" : "IN Progress"
                        }
                      ></Chip>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">
                        {
                          //@ts-ignore
                          task.amount / 100_00_00_000
                        } Sol
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        color="primary"
                        component={Link}
                        href={
                          //@ts-ignore
                          `/utilities/task?id=${task.id}`
                        }
                        aria-label="logout"
                        size="small"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : ''}
            </TableBody>
          </Table>
        )}
      </Box>
    </DashboardCard>
  );
};

export default TaskPerformance;
