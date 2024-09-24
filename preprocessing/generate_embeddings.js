// preprocessing/generate_embeddings.js

import fs from 'fs';
import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false; // Ensure models are fetched from the internet

async function generate_embeddings() {
  // Load the qa_data.json file
  const data = JSON.parse(fs.readFileSync('./data/qa_data.json', 'utf8'));

  // Initialize the feature extraction pipeline with the new model
  console.log('Loading model...');
  const featureExtractor = await pipeline('feature-extraction', 'Xenova/all-mpnet-base-v2');
  console.log('Model loaded successfully.');

  // Function to compute mean pooling of embeddings
  function meanPooling(tokenEmbeddings) {
    const numTokens = tokenEmbeddings.length;
    const embeddingDim = tokenEmbeddings[0].length;
    const sentenceEmbedding = [];

    for (let dim = 0; dim < embeddingDim; dim++) {
      let sum = 0;
      for (let token = 0; token < numTokens; token++) {
        sum += tokenEmbeddings[token][dim];
      }
      sentenceEmbedding.push(sum / numTokens);
    }

    return sentenceEmbedding;
  }

  // Generate embeddings for each question
  for (let item of data.qa_data) {
    try {
      // Get token embeddings as a Tensor
      const output = await featureExtractor(item.question);

      // Extract the embeddings from the Tensor
      // The tensor has dimensions [1, numTokens, embeddingDim]
      const [batchSize, numTokens, embeddingDim] = output.dims;
      const tokenEmbeddings = [];

      for (let i = 0; i < numTokens; i++) {
        const start = i * embeddingDim;
        const end = start + embeddingDim;
        const embedding = output.data.slice(start, end);
        tokenEmbeddings.push(Array.from(embedding));
      }

      // Compute sentence embedding by averaging token embeddings
      const sentenceEmbedding = meanPooling(tokenEmbeddings);

      // Store the sentence embedding
      item.embedding = sentenceEmbedding;
      console.log(`Generated embedding for: "${item.question}"`);
    } catch (err) {
      console.error(`Error processing question: "${item.question}"`, err);
    }
  }

  // Save the updated data with embeddings
  fs.writeFileSync('./data/qa_data_with_embeddings.json', JSON.stringify(data, null, 2));
  console.log('Embeddings generated and saved to qa_data_with_embeddings.json');
}

generate_embeddings().catch(console.error);
