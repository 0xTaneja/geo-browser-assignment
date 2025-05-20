import { createWalletClient, http, parseGwei } from "viem";
import { PrivateKeyAccount } from "viem";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { grc20Testnet } from "../testnet.js";
import { fileURLToPath } from "url";
import { privateKeyToAccount } from "viem/accounts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IPFS_HASH_FILE = path.join(__dirname, '../../data/ipfs_hashes.json');
const SPACE_ID_FILE = path.join(__dirname, '../../data/space_id.json');

async function readIpfsHash() {
    try {
        const data = await fs.promises.readFile(IPFS_HASH_FILE, 'utf-8');
        const result = JSON.parse(data);
        return result.hash;
    }
    catch (error) {
        console.error('Error reading IPFS hash file', error);
        throw error;
    }
}

async function readSpaceId() {
    try {
        const data = await fs.promises.readFile(SPACE_ID_FILE, 'utf-8');
        const result = JSON.parse(data);
        return result.spaceId;
    }
    catch (error) {
        console.error('Error reading Space ID file', error);
        throw error;
    }
}

async function setupWallet() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error('Error !! Private Key is missing');
        process.exit(1);
    }

    const account = privateKeyToAccount(`0x${privateKey}`);
    const rpcUrl = grc20Testnet.rpcUrls.default.http[0];
    const walletClient = createWalletClient({
        account,
        chain: grc20Testnet,
        transport: http(rpcUrl),
    })
    return walletClient;
}

async function publishToGeoTestnet() {
    try {
        const ipfsHash = await readIpfsHash();
        console.log(`IPFS hash to publish : ${ipfsHash}`);

        const spaceId = await readSpaceId();
        console.log(`Using space ID: ${spaceId}`);

        const walletClient = await setupWallet();

        console.log(`Fetching calldata from API for edit in Space ${spaceId}...`);

        const apiUrl = `https://api-testnet.grc-20.thegraph.com/space/${spaceId}/edit/calldata`;
        const payload = {
            spaceId,
            cid: ipfsHash,
            network: "TESTNET",
        }
        console.log("Request payload:", JSON.stringify(payload, null, 2));

        const result = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!result.ok) {
            const errorText = await result.text();
            console.error("API request failed:", result.status, errorText);
            throw new Error(`API Error ${errorText}`);
        }

        const { to, data } = await result.json();
        console.log("Contract Address:", to);
        console.log("Transaction Data: ", data);

        console.log("Sending transaction to blockchain...");

        const gasLimit = BigInt(13000000);
        const baseGasPrice = parseGwei("0.01");

        const txResult = await walletClient.sendTransaction({
            chain: grc20Testnet,
            to,
            data: data.startsWith("0x") ? data : `0x${data}`,
            gas: gasLimit,
            maxFeePerGas: baseGasPrice,
            maxPriorityFeePerGas: baseGasPrice,
            value: BigInt(0),
        });

        console.log("Transaction submitted:", txResult);
        return txResult;

    }
    catch (error) {
        console.error("ERROR:", error);
        throw error;
    }
}

publishToGeoTestnet()
    .then(result => {
        console.log("Successfully published to Geo Testnet!");
    })
    .catch(error => {
        console.error("Failed to publish to Geo Testnet:", error);
        process.exit(1);
    });