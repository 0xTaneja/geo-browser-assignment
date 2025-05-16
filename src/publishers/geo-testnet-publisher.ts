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

const IPFS_HASH_FILE = path.join(__dirname, '../data/ipfs_hashes.json');
const spaceId = "NCdYgAuRjEYgsRrzQ5W4NC"; // Armando Space Id - I need to edit this with my space id 

async function readIpfsHash() {
    try {
        const data = await fs.promises.readFile(IPFS_HASH_FILE, 'utf-8');
        const result = JSON.parse(data);
        return result.hash;
    }
    catch (error) {
        console.error('Error reading IPFS hash file', error);
        return error;
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

