import { getChecksumAddress } from "@graphprotocol/grc-20";
import "dotenv/config";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";
import path from "path";
async function createSpace() {
    try {
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            console.error("ERROR: PRIVATE_KEY is missing in .env file");
            process.exit(1);
        }


        const account = privateKeyToAccount(`0x${privateKey}`);
        const walletAddress = account.address;
        console.log("Using wallet address:", walletAddress);


        const initialEditorAddress = getChecksumAddress(walletAddress);
        console.log("Initial Editor Address (Checksum):", initialEditorAddress);


        const spaceName = "San Francisco Restaurants";


        const requestBody = JSON.stringify({
            initialEditorAddress,
            spaceName,
        });
        console.log("Request Body:", requestBody);


        const startTime = Date.now();
        console.log("Starting request at", new Date(startTime).toISOString());


        const result = await fetch("https://api-testnet.grc-20.thegraph.com/deploy", {
            method: "POST",
            body: requestBody,
        });

        const endTime = Date.now();
        console.log("Request completed at", new Date(endTime).toISOString());
        console.log("Request duration (ms):", endTime - startTime);


        console.log("HTTP Status:", result.status);
        if (!result.ok) {
            console.error("HTTP Error detected. Code:", result.status);
        }


        console.log("Response Headers:");
        result.headers.forEach((value, name) => {
            console.log(`${name}: ${value}`);
        });


        const responseText = await result.text();
        console.log("API Response (raw):", responseText);

        try {
            const responseJson = JSON.parse(responseText);
            console.log("Space created successfully:", responseJson);
            console.log("Your new Space ID is:", responseJson.spaceId);



            const { fileURLToPath } = await import('url');

            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);

            const SPACE_ID_FILE = path.join(__dirname, '../data/space_id.json');
            await fs.promises.writeFile(SPACE_ID_FILE, JSON.stringify({
                spaceId: responseJson.spaceId,
                spaceName,
                createdAt: new Date().toISOString()
            }, null, 2));

            console.log(`Space ID saved to ${SPACE_ID_FILE}`);

            return responseJson.spaceId;
        } catch (error) {
            console.error("Error parsing JSON response:", error);
            throw error;
        }
    } catch (error) {
        console.error("Error creating space:", error);
        process.exit(1);
    }
}

createSpace()
    .then(spaceId => {
        console.log("Space creation complete with ID:", spaceId);
        console.log("You can now update your geo-testnet-publisher.ts to use this Space ID");
    })
    .catch(error => {
        console.error("Failed to create space:", error);
        process.exit(1);
    });