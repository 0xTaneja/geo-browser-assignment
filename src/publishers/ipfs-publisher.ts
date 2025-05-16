import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Ipfs, SetBatchTripleOp, Triple, Relation } from '@graphprotocol/grc-20';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRIPLES_FILE = path.join(__dirname, '../../data/sf_restaurants_triples.json');
const IPFS_HASH_FILE = path.join(__dirname, '../../data/ipfs_hashes.json');

interface IpfsResult {
    hash: string;
    timestamp: string;
}

async function readTripleData() {
    try {
        const data = await fs.promises.readFile(TRIPLES_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error reading triples file', error);
        throw error;
    }
}

async function saveIpfsHash(hash: string) {
    try {
        const result: IpfsResult = {
            hash,
            timestamp: Date.now().toString()
        };
        await fs.promises.writeFile(IPFS_HASH_FILE, JSON.stringify(result, null, 2), 'utf-8');
        console.log(`Saved IPFS hash to ${IPFS_HASH_FILE}`);

    }
    catch (error) {
        console.error('Error saving IPFS hash', error);
        throw error;
    }
}

function convertTriplesToGRC20Format(jsonTriples: any[]) {
    console.log(`Converting ${jsonTriples.length} JSON triples to GRC-20 format...`);

    const grc20Ops = [];

    
    console.log("First triple structure:", JSON.stringify(jsonTriples[0], null, 2));

    for (const triple of jsonTriples) {
        try {
            // Check if this is a relation or a triple
            if (triple.type === 'SET_RELATION') {

                const relationOp = Relation.make({
                    fromId: triple.relation.from,
                    relationTypeId: triple.relation.relationType,
                    toId: triple.relation.to,
                });
                grc20Ops.push(relationOp);
            } else if (triple.type === 'CREATE_RELATION') {

                const relationOp = Relation.make({
                    fromId: triple.relation.fromEntity,
                    relationTypeId: triple.relation.type,
                    toId: triple.relation.toEntity,

                    ...(triple.relation.index ? { index: triple.relation.index } : {}),
                });
                grc20Ops.push(relationOp);
            } else if (triple.type === 'SET_TRIPLE') {

                const tripleOp = Triple.make({
                    entityId: triple.triple.entity,
                    attributeId: triple.triple.attribute,
                    value: {
                        type: triple.triple.value.type,
                        value: triple.triple.value.value,
                    }
                });
                grc20Ops.push(tripleOp);
            } else {
                console.warn(`Unknown triple type: ${triple.type}`);
            }
        } catch (error) {
            console.error("Error processing triple:", JSON.stringify(triple, null, 2));
            console.error(error);

        }
    }

    console.log(`Converted ${grc20Ops.length} operations`);
    return grc20Ops;
}

async function publishdatatoIpfs() {
    try {
        console.log('Reading triples data...');
        const triples = await readTripleData();

        console.log(`Publishing ${triples.length} triples to IPFS`);

        //JSON triples to GRC-20 format
        const grc20Ops = convertTriplesToGRC20Format(triples);

        const edits = {
            name: 'San Francisco Restaurants Data',
            ops: grc20Ops,
            author: "San Francisco Restaurant Data Publisher"
        };

        const result = await Ipfs.publishEdit(edits);
        const ipfsHash = (result as any).cid || (result as any).ipfsHash || JSON.stringify(result);
        console.log(`Successfully published to IPFS with hash: ${ipfsHash}`);

        await saveIpfsHash(ipfsHash);

        return ipfsHash;
    }
    catch (error) {
        console.error('Error publishing to IPFS:', error);
        throw error;
    }
}

publishdatatoIpfs().then(hash => {
    console.log('IPFS publication complete with hash:', hash);
}).catch(error => {
    console.error('IPFS publication failed:', error);
    process.exit(1);
})