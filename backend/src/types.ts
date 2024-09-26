import * as z from "zod";

export const createTask = z.object({
    title: z.string().optional(),
    options: z.array(
        z.object({
            image_url: z.string()
        })
    ),
    signature: z.string()
})

export const createSubmission = z.object({
    selection: z.number(),
    task_id: z.number()
})


export const createUser = z.object({
    // signature: z.string(),
    publicKey: z.string()
    // task_id: z.number()
})