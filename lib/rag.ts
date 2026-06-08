import { generateEmbedding } from './embedding';
import { prisma } from './prisma';

// Prisma client is already correctly imported as `prisma`
// No need to rename it unless you prefer

interface DocumentMetadata {
  source?: string;
  category?: string;
  jobId?: string;
  [key: string]: unknown;
}

interface SearchResult {
  content: string;
  metadata: DocumentMetadata | null;
  similarity: number;
}

/**
 * Store a single document with its embedding in the vector database.
 * Assumes pgvector extension is enabled and a `Document` table exists with:
 * - id: TEXT PRIMARY KEY DEFAULT gen_random_uuid()
 * - content: TEXT NOT NULL
 * - embedding: vector(384)
 * - metadata: JSONB
 * - createdAt: TIMESTAMPTZ DEFAULT NOW()
 */
export async function storeDocument(
  content: string,
  metadata?: DocumentMetadata
): Promise<string> {
  const embedding = await generateEmbedding(content);
  const embeddingStr = `[${embedding.join(',')}]`;

  // Use $queryRaw with parameterized values to avoid SQL injection
  const result = await prisma.$queryRaw<{ id: string }[]>`
    INSERT INTO "Document" (content, embedding, metadata)
    VALUES (${content}, ${embeddingStr}::vector(384), ${JSON.stringify(metadata || {})}::jsonb)
    RETURNING id
  `;

  if (!result || result.length === 0) {
    throw new Error('Failed to store document');
  }
  return result[0].id;
}

/**
 * Store multiple documents in batch (sequentially; for true batch see below)
 */
export async function storeDocuments(
  documents: Array<{ content: string; metadata?: DocumentMetadata }>
): Promise<string[]> {
  const ids: string[] = [];
  for (const doc of documents) {
    const id = await storeDocument(doc.content, doc.metadata);
    ids.push(id);
  }
  return ids;
}

/**
 * Alternative: batch insert using unnest (more efficient for many docs)
 * This requires generating embeddings in parallel before batch insert.
 */
export async function storeDocumentsBatch(
  documents: Array<{ content: string; metadata?: DocumentMetadata }>
): Promise<string[]> {
  // Generate embeddings in parallel
  const embeddings = await Promise.all(
    documents.map((doc) => generateEmbedding(doc.content))
  );

  // Build arrays for unnest
  const contents = documents.map((doc) => doc.content);
  const embeddingStrs = embeddings.map((emb) => `[${emb.join(',')}]`);
  const metadataJsons = documents.map((doc) => JSON.stringify(doc.metadata || {}));

  const result = await prisma.$queryRaw<{ id: string }[]>`
    INSERT INTO "Document" (content, embedding, metadata)
    SELECT * FROM UNNEST(
      ${contents}::text[],
      ${embeddingStrs}::vector(384)[],
      ${metadataJsons}::jsonb[]
    )
    RETURNING id
  `;
  return result.map((row) => row.id);
}

/**
 * Perform vector similarity search using cosine distance (<=> operator).
 * Returns results ordered by similarity descending.
 */
export async function vectorSearch(
  query: string,
  limit = 5,
  minSimilarity = 0.5
): Promise<SearchResult[]> {
  const embedding = await generateEmbedding(query);
  const embeddingStr = `[${embedding.join(',')}]`;

  const results = await prisma.$queryRaw<SearchResult[]>`
    SELECT 
      content,
      metadata,
      (1 - (embedding <=> ${embeddingStr}::vector(384))) AS similarity
    FROM "Document"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${embeddingStr}::vector(384)
    LIMIT ${limit}
  `;

  // Filter by minimum similarity threshold
  return results.filter((r: any) => r.similarity >= minSimilarity);
}

/**
 * Get concatenated context string for RAG from the top matching documents.
 */
export async function getRelevantContext(
  query: string,
  maxDocs = 3
): Promise<string> {
  const results = await vectorSearch(query, maxDocs);
  if (results.length === 0) return '';
  return results.map((r: any) => r.content).join('\n\n---\n\n');
}

/**
 * Delete a document by its ID.
 */
export async function deleteDocument(id: string): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM "Document" WHERE id = ${id}
  `;
}

/**
 * Seed the vector database with sample job descriptions (only if empty).
 */
export async function seedSampleDocuments(): Promise<void> {
  const count = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*)::int FROM "Document"
  `;
  if (count[0].count > 0) {
    console.log('Documents already present, skipping seed.');
    return;
  }

  const sampleDocs = [
    {
      content: 'Leaking pipe under kitchen sink, water dripping constantly. Need urgent plumber.',
      metadata: { category: 'plumbing', source: 'sample' },
    },
    {
      content: 'AC not cooling properly, making loud noise. Needs servicing or repair.',
      metadata: { category: 'ac', source: 'sample' },
    },
    {
      content: 'Electrical short circuit in bedroom, lights flickering. Need electrician.',
      metadata: { category: 'electrical', source: 'sample' },
    },
    {
      content: 'General home maintenance - fix door hinges, paint touch-up, minor repairs.',
      metadata: { category: 'maintenance', source: 'sample' },
    },
  ];

  await storeDocuments(sampleDocs);
}