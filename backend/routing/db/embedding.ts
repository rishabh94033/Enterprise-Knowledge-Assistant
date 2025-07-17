import {QdrantClient} from '@qdrant/js-client-rest';
import { getallconfluence } from '../confluence';
import { pipeline } from '@xenova/transformers';
import express, { Request, Response } from 'express';
// require("dotenv").config(); // Load .env variable

import dotenv from 'dotenv';
dotenv.config();
// 

const client = new QdrantClient({
    url: 'https://3092cc85-be71-4e63-91b6-a173dd526d3b.europe-west3-0.gcp.cloud.qdrant.io:6333',
    apiKey: process.env.QUDRANT_API_KEY,
});



// async function createCollection() {
// try {
//     const result = await client.getCollections();
//     console.log('List of collections:', result.collections);
// } catch (err) {
//     console.error('Could not get collections:', err);
// }}



function chunkText(text: string, maxLength = 1000): string[] {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += " " + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

const plainText = await getallconfluence(); // Fetch the Confluence content
if (!plainText) {
  throw new Error("No content fetched from Confluence");
}
const chunks = chunkText(plainText); // Now ready for embedding
// console.log(chunks);

const embeddings = await embedChunks(chunks); // Embed the chunks

export async function embedChunks(chunks: string[]) {
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const embeddings = [];
  for (const chunk of chunks) {
    const output = await extractor(chunk, { pooling: 'mean', normalize: true });
    embeddings.push(output.data); // Each `output.data` is a float[] vector
  }

  return embeddings;
}

const embeddingrouter = express.Router();


//check route

// embeddingrouter.get('/embedding', async (_req: Request, res: Response) => {
//   try {
//     const chunks=["casual leave policy","sick leave policy","expense reimbursement policy"];
//     const embeddings = await embedChunks(chunks);
//     res.json({ embeddings });
//     return;
//   } catch (error) {
//     console.error('Error embedding chunks:', error);
//     res.status(500).json({ error: 'Failed to embed chunks' });
//     return;
//   }
// });

export default embeddingrouter;
