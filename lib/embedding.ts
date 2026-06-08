import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers';

let embedder: FeatureExtractionPipeline | null = null;

async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedder) {
    // Use all-MiniLM-L6-v2 for efficient 384-dim embeddings
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

/**
 * Generate a 384-dimensional embedding vector for the given text
 * Uses Xenova/all-MiniLM-L6-v2 model running locally via transformers.js
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = await getEmbedder();
  const result = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data as Float32Array);
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const text of texts) {
    embeddings.push(await generateEmbedding(text));
  }
  return embeddings;
}
