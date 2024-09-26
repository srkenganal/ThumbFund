import express, { Response, Request } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { S3Client } from "@aws-sdk/client-s3";
import nacl from "tweetnacl";

import bs58 from "bs58";

import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import {
  taskDefaultTitle,
} from "../config";

import { auth } from "../middlewares/auth";
import { createTask, createUser } from "../types";
// import { PublicKey, Connection } from "@solana/web3.js";
const {
  Connection,
  clusterApiUrl,
  PublicKey,
  SystemProgram,
} = require("@solana/web3.js");
// import { Keypair } from "@solana/web3.js";

interface CustomRequest extends Request {
  userId?: string;
}

const prisma = new PrismaClient();

const router = express.Router();

// const connection = new Connection("https://api.devnet.solana.com")

// Use Devnet instead of Testnet
const connection = new Connection(clusterApiUrl("testnet"), "confirmed");

// https://api.testnet.solana.com

interface PresignedUrlParams {
  region: string;
  bucket: string;
  key: string;
}

// const createPresignedUrlWithClient = ({ region, bucket, key }:PresignedUrlParams ) => {
//     const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: 'img/png' });
//     return getSignedUrl(client, command, { expiresIn: 3600 });
// };

router.post("/signin", async (req: Request, res: Response) => {
  console.log("sign in method");

  // const walletAddress = "Fqq8GXD3x9bMdUzKEJzQqi48LC9pC4q9FxmM2ZLBjh5e";

  const parsedData = createUser.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Invalid Signature and Public Key.",
    });
  }

  const message = new TextEncoder().encode(
    `brodify wants you to sign in with your Solana account. Please sign in.`
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
    const userExists = await prisma.user.findUnique({
      where: {
        address: parsedData.data.publicKey,
      },
    });

    if (!userExists) {
      const user = await prisma.user.create({
        data: {
          address: parsedData.data.publicKey,
        },
      });
      const token = jwt.sign({ userId: user.id }, process.env.secreKey || '');
      return res.status(200).json({ token });
    } else {
      const token = jwt.sign({ userId: userExists.id }, process.env.secreKey || '');
      return res.status(200).json({ token });
    }
  } catch (e) {
    console.log(e, "ERROR");
    res.status(500).json("Something went wrong!!!");
  }
  // SIGN IN.
});

router.get(
  "/presigned-url",
  auth,
  async (req: CustomRequest, res: Response) => {
    try {
      const REGION = "ap-south-1";
      const BUCKET = "dapp-first";
      const KEY = "user-thumnails/image.png";

      // const client = new S3Client({ region: REGION });

      const client = new S3Client({
        region: REGION,
        credentials: {
          secretAccessKey: process.env.secretAccessKey || '',
          accessKeyId: process.env.accessKeyId || '',
        },
      });

      // const clientUrl = await createPresignedUrlWithClient({
      //     region: REGION,
      //     bucket: BUCKET,
      //     key: KEY,
      //   });

      const { url, fields } = await createPresignedPost(client, {
        Bucket: "dapp-first",
        Key: `user-thumnails/${req?.userId}/${Date.now()}/image.png`,
        // Conditions,
        Fields: {
          "Content-Type": "image/png",
        },
        Expires: 600, //Seconds before the presigned post expires. 3600 by default.
      });

      res.status(200).json({ url, fields });
    } catch (e) {
      console.log(e, "ERROR");
      res.status(500).json("Something went wrong!!!");
    }
  }
);

const parseTransaction = (transaction: any) => {
  const { message } = transaction?.transaction;
  const instructions = message.instructions;

  //   console.log(transaction, "***acsd");

  //   console.log("Pre-balance (lamports):", transaction.meta.preBalances);
  // console.log("Post-balance (lamports):", transaction.meta.postBalances);

  // const transferredLamports = transaction.meta.preBalances[0] - transaction.meta.postBalances[0];
  // console.log("Amount transferred (lamports):", transferredLamports);
  // console.log("Amount transferred (SOL):", transferredLamports / 1_000_000_000);

  let obj = {
    amount:Number||0,
    toPubkey:String||'',
    fromPubkey:String||''
  };

  instructions.forEach((instruction: any, index: number) => {
    const programId = message.accountKeys[instruction.programIdIndex];

    // Check if the instruction is a SystemProgram transfer (native SOL transfer)
    if (programId.equals(SystemProgram.programId)) {
      const fromPubkey =
        message.accountKeys[instruction.accounts[0]].toBase58();
      const toPubkey = message.accountKeys[instruction.accounts[1]].toBase58();


      // The data field contains the amount in lamports, you can parse it depending on the encoding
      // const amount = instruction.data.readUInt32LE(0); // Reading as 32-bit unsigned integer
      const dataArray = bs58.decode(instruction.data);

      // Convert Uint8Array to a Buffer to use readUInt32LE
      const dataBuffer = Buffer.from(dataArray);

      // Assuming data is in the first 32 bits (change as needed for your structure)
      // const amount = dataBuffer.readUInt32LE(0);

      //       // Decode the instruction data
      // const dataArray = bs58.decode(instruction.data);
      // const dataBuffer = Buffer.from(dataArray);

      // // Try reading with different offsets or data formats
      // const amount = dataBuffer.readUInt32LE(0); // Assuming first 32 bits


      // @ts-ignore
      obj.amount = dataBuffer.readUInt32LE(4);


      
      // @ts-ignore

      obj.fromPubkey = fromPubkey;
      // @ts-ignore

      obj.toPubkey = toPubkey;

      // console.log(`Amount (lamports): ${amount}`);
      // console.log(`Amount2 (lamports): ${amount2}`);

      // console.log(`Amount (SOL): ${amount / 1_000_000_000} SOL`);
      // console.log(`Amount2 (SOL): ${amount2 / 1_000_000_000} SOL`);

      // console.log(`Instruction ${index + 1}:`);
      // console.log(`From: ${fromPubkey}`);
      // console.log(`To: ${toPubkey}`);
      // console.log(`Amount (lamports): ${amount}`);
      // console.log(`Amount (SOL): ${amount / 1_000_00} SOL`);
    }
  });

  return obj
};

// Assuming 'transaction' is the transaction object you've already fetched

router.post("/task", auth, async (req: Request, res: Response) => {
  //@ts-ignore
  const body = req.body;
  //@ts-ignore
  const userId = req.userId;

  const parsedData = createTask.safeParse(body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Invalid Input.",
    });
  }

  const transaction = await connection.getTransaction(
    parsedData.data.signature,
    {
      maxSupportedTransactionVersion: 1,
      commitment: "confirmed",
    }
  );

  if (!transaction) {
    console.error("Transaction not found");
    return;
  }

  // Extract the transaction message
  const message = transaction.transaction.message;

  let transDetails = parseTransaction(transaction);

  // Loop through the instructions
  // message.instructions.forEach((instruction:any, index:any) => {
  //   console.log(`Instruction ${index + 1}:`);

  //   console.log(instruction, "*** INSTRCUT ***", SystemProgram);

  //   // Check if it's a SOL transfer (SystemProgram)
  //   if (instruction.programIdIndex.equals(SystemProgram.programId)) {
  //     const fromPubkey = message.accountKeys[instruction.keys[0]].toBase58();
  //     const toPubkey = message.accountKeys[instruction.keys[1]].toBase58();
  //     const amount = instruction.data.readUInt32LE(0); // Lamports (1 SOL = 1,000,000,000 lamports)

  //     console.log(`From: ${fromPubkey}`);
  //     console.log(`To: ${toPubkey}`);
  //     console.log(`Amount (lamports): ${amount}`);
  //     console.log(`Amount (SOL): ${amount / 1_000_000_000} SOL`);
  //   }
  // });

  // console.log(transaction, "Dfadsfadsfds dfa3reqwer")

  let response = await prisma.$transaction(async (tx) => {
    const taskResp = await tx.task.create({
      data: {
        title: parsedData.data.title ?? taskDefaultTitle,
        signature: parsedData.data.signature,
        amount: Number(transDetails?.amount),
        user_id: userId,
      },
    });

    await tx.option.createMany({
      data: parsedData.data.options.map((option, index) => {
        return {
          task_id: taskResp.id,
          image_url: option.image_url,
          option_id: index + 1,
        };
      }),
    });

    return taskResp;
  });

  return res.status(200).json(response.id);
});

router.get("/task/:taskId", auth, async (req: Request, res: Response) => {
  //@ts-ignore
  const body = req.body;
  //@ts-ignore
  const userId = req.userId;

  const taskId: String = req.params.taskId;

  const tasks = await prisma.task.findFirst({
    where: {
      user_id: userId,
      id: Number(taskId),
    },
    include: {
      options: true,
    },
  });

  if (!tasks) {
    return res.status(411).json({
      message: "No tasks found for you!",
    });
  }

  const submissionResp = await prisma.submission.findMany({
    where: {
      task_id: Number(taskId),
    },
    include: {
      option: true,
    },
  });

  let result: Record<
    string,
    {
      count: number;
      option: {
        imageUrl: string;
      };
      option_id: number;
    }
  > = {};

  tasks.options.forEach((option) => {
    result[option.id] = {
      count: 0,
      option: {
        imageUrl: `${process.env.cloudFrontPath}${option.image_url}`,
      },
      option_id: option.id,
    };
  });

  submissionResp.forEach((resp) => {
    result[resp.option_id].count++;
  });

  return res
    .status(200)
    .json({ submissionRes: result, taskTitle: tasks.title });
});

router.get("/task", auth, async (req: Request, res: Response) => {
  //@ts-ignore
  const body = req.body;
  //@ts-ignore
  const userId = req.userId;

  const tasks = await prisma.task.findMany({
    where: {
      user_id: userId,
    },
    select: {
      id: true,
      title: true,
      done: true,
      amount: true,
    },
  });

  if (!tasks) {
    return res.status(411).json({
      message: "No tasks found for you!",
    });
  }
  let filteredTasks = tasks.map((item) => ({...item, amount: item.amount.toString()}))
  return res.status(200).json(filteredTasks);
});

module.exports = router;

// "https://dapp-first.s3.ap-south-1.amazonaws.com/user-thumnails?X-Amz-Algorithm=&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA5FTZDELWN5ES36Z5%2F20240814%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20240814T103406Z&X-Amz-Expires=3600&X-Amz-Signature=93ae83c5fcdcd2dcb7f293c35f390cbd4e9e6a84181c374ba87f010e916fc965&X-Amz-SignedHeaders=host&x-id=GetObject"
