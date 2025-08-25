const { pipeline } = require("@xenova/transformers")
const { indexes } = require('../configs/tags.json')
const fs = require('fs');
const path = require('path');


const TAG_EMBEDDINGS_FILE = path.join(__dirname, '../configs/tagVectors.json');

let embedder;
let tagsVectorFlat = []

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

function cosineSimilarity(vecA, vecB) {
    if (!vecA.length || !vecB.length) return 0;

    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function generateWeightedTagsFromContent(postText, minTags = 3, maxTags = 7) {
    // 1️⃣ Convert post into vector
    const postEmbedding = await embedder(postText, { pooling: 'mean', normalize: true });
    const postVector = flattenEmbedding(postEmbedding);

    // 2️⃣ Compute similarity with each tag
    const sims = tagsVectorFlat.map((tagVector, i) => ({
        tag: Object.values(indexes)[i],
        score: cosineSimilarity(postVector, tagVector)
    }));

    // 3️⃣ Sort tags by similarity descending
    sims.sort((a, b) => b.score - a.score);

    // 4️⃣ Pick top N tags randomly between minTags and maxTags
    const numTags = Math.min(Math.max(minTags, Math.floor(Math.random() * (maxTags - minTags + 1) + minTags)), sims.length);
    const topTags = sims.slice(0, numTags);

    // 5️⃣ Normalize weights
    const total = topTags.reduce((sum, t) => sum + t.score, 0);
    const weightedTags = {};
    topTags.forEach(t => {
        weightedTags[t.tag] = +(t.score / total).toFixed(4);
    });

    return weightedTags;
}

module.exports = { init, generateWeightedTagsFromContent }