import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const client = new InferenceClient(
  process.env.HF_TOKEN
);

async function run() {

  const image =
    await client.textToImage({

      provider:
      "hf-inference",

      model:
      "black-forest-labs/FLUX.1-schnell",

      inputs:
      "Futuristic AI office with robots"

    });

  const blob =
    image as unknown as Blob;

  const buffer =
    Buffer.from(
      await blob.arrayBuffer()
    );

  fs.writeFileSync(
    "test.jpg",
    buffer
  );

  console.log(
    "test.jpg generated"
  );

}

run();