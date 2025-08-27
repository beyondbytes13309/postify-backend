const { pipeline } = require("@xenova/transformers")
const { indexes } = require('../configs/tags.json')
const fs = require('fs');
const path = require('path');

/*
Most of the code from this module is AI-generated and is tweaked and glued togehter by me. Like not the whole module but individual snippets inside
of the functions. Because there is a lot of math in this module, I will understand all of it and at least write some comments 
*/

const TAG_EMBEDDINGS_FILE = path.join(__dirname, '../configs/tagVectors.json');

let embedder; // an embedder is a function that converts input into vectors
let tagsVectorFlat = []

// this function safely converts an embedding or a typed array into a javascript array
function flattenEmbedding(embedding) {
    if (!embedding || !embedding.data) return [];

    let arr = embedding.data;

    // Convert typed array to normal array
    if (arr instanceof Float32Array) arr = Array.from(arr);

    // If nested array (like [[...]]), flatten safely
    while (Array.isArray(arr[0])) {
        arr = arr.flat();
    }

    return arr;
}

const init = async () => {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

    if (fs.existsSync(TAG_EMBEDDINGS_FILE)) {
        console.log("Loading cached tag embeddings...");
        const saved = JSON.parse(fs.readFileSync(TAG_EMBEDDINGS_FILE, 'utf-8'));
        tagsVectorFlat = Object.values(saved);
        return;
    }

    console.log("Computing tag embeddings...");
    const tags = Object.keys(indexes);
    const tagVectors = {};

    for (const tag of tags) {
        const emb = await embedder(tag, { pooling: 'mean', normalize: true });
        tagVectors[tag] = flattenEmbedding(emb);
    }

    // Save embeddings for future use
    fs.writeFileSync(TAG_EMBEDDINGS_FILE, JSON.stringify(tagVectors));
    tagsVectorFlat = Object.values(tagVectors);
};

// this function takes in two vectors and  ouputs how similar they are; -1 = opposite | 0 = unrelated | 1 = exact match
function cosineSimilarity(vecA, vecB) {
    if (!vecA.length || !vecB.length || vecA.length != vecB.length ) return 0;

    /* Finding the similarity between vectors:
    - First take the dot product of the vectors (e.g. (1, 384) with (1, 384))
    - Then find the magnitudes of both vectors (A1^2 + A2^2 + A3^3 + ... An^2)
    - Find the product of both the magnitudes
    - Divide the dot product by the product of magnitudes
    */
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i]; // A . B
        normA += vecA[i] * vecA[i]; // A1^2 + A2^2 + A3^3 + ... An^2
        normB += vecB[i] * vecB[i]; // B1^2 + B2^2 + B3^3 + ... Bn^2
    }

    if (normA === 0 || normB === 0) return 0; // unrelated if any magnitude is 0 
    return dot / (Math.sqrt(normA) * Math.sqrt(normB)); // (A . B) / (sqrt(normA) * sqrt(normB))
}

async function generateWeightedTagsFromContent(postText, minTags = 3, maxTags = 10) {
    const minScore = 0.1

    // 1: Convert post into vector
    const postEmbedding = await embedder(postText, { pooling: 'mean', normalize: true });
    const postVector = flattenEmbedding(postEmbedding);

    // 2: Compute similarity with each tag
    let sims = tagsVectorFlat.map((tagVector, i) => ({
        tag: Object.values(indexes)[i],
        score: cosineSimilarity(postVector, tagVector)
    }));

    // 3: Sort tags by similarity descending
    sims.sort((a, b) => b.score - a.score);
    sims = sims.filter(t => t.score >= minScore)

    // 4: Pick top N tags randomly between minTags and maxTags
    const numTags = Math.floor(Math.random() * (maxTags - minTags + 1)) + minTags
    const topTags = sims.slice(0, numTags);

    if (topTags.length < minTags) {
        const missingNumberOfTags = minTags - topTags.length
        const remainingTags = sims.slice(topTags.length)
        topTags = topTags.concat(remainingTags.slice(0, missingNumberOfTags))
    }

    // 5: Normalize weights
    const sum = topTags.reduce((acc, current) => acc + current.score, 0);
    const weightedTags = {};
    topTags.forEach(t => {
        weightedTags[t.tag] = +(t.score / sum).toFixed(4);
    });

    return weightedTags;
}

module.exports = { init, generateWeightedTagsFromContent }