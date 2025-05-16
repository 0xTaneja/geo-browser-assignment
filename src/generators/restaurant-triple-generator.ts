import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Ipfs } from '@graphprotocol/grc-20';
import {
    RestaurantEntity,
    CuisineEntity,
    parseCuisineTypes,
    formatRestaurantEntity,
} from '../models/restaurant-entities.js';

import {
    generateUniqueId,
    createRestaurantTriples,
    createCuisineRelation,
    createCuisineTriple,
} from '../utils/triple-formatter.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '../../data/sf_restaurants.json');
const TRIPLES_OUTPUT_FILE = path.join(__dirname, '../../data/sf_restaurants_triples.json');

async function readRestaurantData(): Promise<any[]> {
    try {
        const data = await fs.promises.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error reading restaurant data', error);
        return [];
    }
}

function extractCuisineTypes(restaurants: any[]): string[] {
    const allCuisineTypes = new Set<string>();

    restaurants.forEach(restaurant => {
        if (restaurant.fooditems) {
            const cuisines = parseCuisineTypes(restaurant.fooditems);
            cuisines.forEach(cuisine => allCuisineTypes.add(cuisine));

        }
    });

    return Array.from(allCuisineTypes);


}

function createCuisineMapping(cuisineTypes: string[]): Map<string, string> {
    const cuisineMap = new Map<string, string>();

    cuisineTypes.forEach(cuisine => {
        const cuisineId = generateUniqueId();
        cuisineMap.set(cuisine, cuisineId);
    })
    return cuisineMap;
}

async function generateAllTriples() {
    try {
        console.log('Reading restaurant data...');
        const restaurants = await readRestaurantData();
        console.log(`found ${restaurants.length} restaurants`);

        console.log(`Extracting cuisine types...`);
        const cuisineTypes = extractCuisineTypes(restaurants);
        console.log(`Found ${cuisineTypes.length} unique cuisine types`);

        const cuisineMap = createCuisineMapping(cuisineTypes);

        const allOps: any[] = [];

        console.log(`Generating Cuisine Entities...`);
        cuisineTypes.forEach(cuisineName => {
            const cuisineId = cuisineMap.get(cuisineName)!;
            const cuisineEntity: CuisineEntity = {
                id: cuisineId,
                name: cuisineName
            };

            const cuisineTriple = createCuisineTriple(cuisineEntity);
            if (cuisineTriple)
                allOps.push(cuisineTriple);

        });
        console.log(`Creating Restaurant Entities and relations...`);
        restaurants.forEach(restaurant => {
            const restaurantId = generateUniqueId();
            const restaurantEntity = formatRestaurantEntity(restaurant, restaurantId);

            const restaurantTriples = createRestaurantTriples(restaurantEntity);
            allOps.push(...restaurantTriples);

            if (restaurant.fooditems) {
                const cuisines = parseCuisineTypes(restaurant.fooditems);
                cuisines.forEach(cuisine => {
                    const cuisineId = cuisineMap.get(cuisine);
                    if (cuisineId) {
                        const relation = createCuisineRelation(restaurantId, cuisineId);
                        if (relation)
                            allOps.push(relation);
                    }
                });
            }

        });

        console.log(`Generated ${allOps.length} total operations`);

        await fs.promises.writeFile(TRIPLES_OUTPUT_FILE, JSON.stringify(allOps, null, 2), 'utf-8');

        console.log(`Saved Triples to ${TRIPLES_OUTPUT_FILE}`);

        return allOps;
    }
    catch (error) {
        console.error('Error generating triples', error);
        return [];
    }
}

generateAllTriples().then(() => {
    console.log('Triple generation complete!');
}).catch(error => {
    console.error('error', error);
})