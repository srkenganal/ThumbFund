import express, { Response, Request } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { TOTAL_TASK_ALLOWED } from "../config";
import { workerAuth } from "../middlewares/workerAuth";
import { createSubmission } from "../types";
import { getNextTask } from "../db";
import { createUser } from "../types";

import bs58 from "bs58";
import nacl from "tweetnacl";
import { Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
const {
  Connection,
  clusterApiUrl,
  PublicKey,
  SystemProgram,
  Transaction,
} = require("@solana/web3.js");

const router = express.Router();

const prisma = new PrismaClient();

const connection = new Connection(clusterApiUrl("testnet"), "confirmed");

router.post("/signin", async (req: Request, res: Response) => {
  console.log("sign in method");

  const parsedData = createUser.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Invalid Signature and Public Key.",
    });
  }

  const message = new TextEncoder().encode(
    `workify wants you to sign in with your Solana account. Please sign in.`
  );

  const result = nacl.sign.detached.verify(
    message,
    new Uint8Array(req.body.signature.data),
    new PublicKey(req.body.publicKey).toBytes()
  );

  if (!result) {
    return res.status(411).json({
      message: "Invalid Signature.",
    });
  }

  try {
    const userExists = await prisma.worker.findUnique({
      where: {
        address: parsedData.data.publicKey,
      },
      select: {
        locked_bal: true,
        pending_bal: true,
        id: true,
      },
    });

    if (!userExists) {
      const user = await prisma.worker.create({
        data: {
          address: parsedData.data.publicKey,
          pending_bal: 0,
          locked_bal: 0,
        },
      });
      const token = jwt.sign({ userId: user.id }, process.env.workerSecretKey || '');
      return res.status(200).json({ token, pending_bal: 0, locked_bal: 0 });
    } else {
      const token = jwt.sign({ userId: userExists.id }, process.env.workerSecretKey||'');
      return res.status(200).json({
        token,
        pending_bal: userExists.pending_bal.toString(),
        locked_bal: userExists.locked_bal.toString(),
      });
    }
  } catch (e) {
    console.log(e, "ERROR");
    res.status(500).json("Something went wrong!!!");
  }
  // SIGN IN.
});

router.post("/payout", workerAuth, async (req: Request, res: Response) => {
  //@ts-ignore
  let userId = req.userId;

  const workerRep = await prisma.worker.findFirst({
    where: {
      id: userId,
    },
  });

  if (!workerRep) {
    return res.status(411).json({
      message: "No User",
    });
  }

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(process.env.ADMIN_WALLET_ADDRESS),
      toPubkey: new PublicKey(workerRep.address),
      lamports: workerRep.pending_bal,
    })
  );

  const privateKeyBase58 = process.env.PHANTOM_PRIVATE_KEY; // from Phantom
  //@ts-ignore
  const secretKey = bs58.decode(privateKeyBase58);
  const keyPair = Keypair.fromSecretKey(secretKey);

  // const keyPair = Keypair.fromSecretKey(decode("privateket"));
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    keyPair,
  ]);

  let resp = await prisma.$transaction(async (tx) => {
    return await tx.worker.update({
      where: {
        id: Number(userId),
      },
      data: {
        pending_bal: {
          decrement: workerRep.pending_bal,
        },
        locked_bal: {
          increment: workerRep.pending_bal,
        },
      },
    });
  });

  console.log(signature, "** FINAL SIGNATURE ***");

  return res.status(200).json("Done");
});

router.get("/balance", workerAuth, async (req: Request, res: Response) => {
  //@ts-ignore
  let userId = req.userId;

  const response = await prisma.worker.findFirst({
    where: {
      id: userId,
    },
    select: {
      locked_bal: true,
      pending_bal: true,
    },
  });

  if (!response) {
    return res.status(411).json({
      message: "NO Balance/No User",
    });
  }

  return res.status(200).json({
    ...response,
    locked_bal: response.locked_bal.toString(),
    pending_bal: response.pending_bal.toString(),
  });
});

router.get("/next-task", workerAuth, async (req: Request, res: Response) => {
  //@ts-ignore
  let userId = req.userId;

  const response = await getNextTask(userId);

  const result = response?.options.map((option) => {
    return {
      ...option,
      imageUrl: `${process.env.cloudFrontPath}${option.image_url}`,
    };
  });

  if (!response) {
    return res.status(411).json({
      message: "NO more tasks",
    });
  }

  return res.status(200).json(result);
});

router.post("/submission", workerAuth, async (req: Request, res: Response) => {
  //@ts-ignore
  let userId = req.userId;

  const parsedData = createSubmission.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Invalid Input.",
    });
  }

  const nextTaskResp = await getNextTask(userId);

  if (!nextTaskResp || nextTaskResp.id !== parsedData.data.task_id) {
    return res.status(411).json({
      message: "You have already completed this task.",
    });
  }

  let response = await prisma.$transaction(async (tx) => {
    let submissionAmt = Number(
      nextTaskResp.amount / BigInt(TOTAL_TASK_ALLOWED)
    );
    const taskResp = await tx.submission.create({
      data: {
        task_id: parsedData.data.task_id,
        option_id: parsedData.data.selection,
        amount: submissionAmt.toString(),
        worker_id: userId,
      },
    });

    await tx.worker.update({
      where: {
        id: userId,
      },
      data: {
        pending_bal: {
          increment: submissionAmt,
        },
      },
    });

    // await tx.task.update({
    //   where: {
    //     id: parsedData.data.task_id,
    //   },
    //   data: {
    //     done: true,
    //   },
    // });
    taskResp.amount = taskResp.amount.toString();
    return taskResp;
  });

  const nextTask = await getNextTask(userId);

  return res.status(201).json(nextTask);
});

router.post("/signin", async (req, res) => {
  // SIGN IN.
  console.log("sign in method");

  const walletAddress = "Fqq8GXD3x9bMdUzKEJzQqi48LC9pC4q9FxmM2ZLBjh5w";

  try {
    const workerExists = await prisma.worker.findUnique({
      where: {
        address: walletAddress,
      },
    });

    if (!workerExists) {
      const worker = await prisma.worker.create({
        data: {
          address: walletAddress,
          locked_bal: 0,
          pending_bal: 0,
        },
      });
      const token = jwt.sign({ userId: worker.id }, process.env.workerSecretKey || '');
      return res.status(200).json({ token });
    } else {
      const token = jwt.sign({ userId: workerExists.id }, process.env.workerSecretKey || '');
      return res.status(200).json({ token });
    }
  } catch (e) {
    console.log(e, "ERROR");
    res.status(500).json("Something went wrong!!!");
  }
});

module.exports = router;
