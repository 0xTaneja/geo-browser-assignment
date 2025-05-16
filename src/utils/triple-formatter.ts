import crypto, { randomBytes } from 'crypto';
import bs58 from 'bs58';
import { Triple, Relation } from '@graphprotocol/grc-20';
import {
    RestaurantEntity,
    CuisineEntity,
    RESTAURANT_ADDRESS_ATTRIBUTE_ID,
    RESTAURANT_NAME_ATTRIBUTE_ID,
    RESTAURANT_FOODITEMS_ATTRIBUTE_ID,
    RESTAURANT_LONGITUDE_ATTRIBUTE_ID,
    RESTAURANT_LATITUDE_ATTRIBUTE_ID,
    RESTAURANT_STATUS_ATTRIBUTE_ID,
    RESTAURANT_TYPE_ID,
    CUISINE_RELATION_TYPE_ID,
    CUISINE_TYPE_ID




} from '../models/restaurant-entities.js';




export function generateUniqueId(): string {
    const randomBytes = crypto.randomBytes(16);
    return bs58.encode(randomBytes);
}

export function createTextTriple(entityId: string, attributeId: string, value: string): any {
    if (!value || value.trim() === '') {
        return null;
    }

    return Triple.make({
        entityId,
        attributeId,
        value: {
            type: 'TEXT',
            value
        }
    });
}

export function createNumberTriple(entityId: string, attributeId: string, value: number | string): any {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue))
        return null;

    return Triple.make({
        entityId,
        attributeId,
        value: {
            type: 'NUMBER',
            value: numericValue.toString()
        }
    })

}

export function createRelation(fromId: string, relationTypeId: string, toId: string): any {
    return Relation.make({
        fromId,
        relationTypeId,
        toId,
    });
}

export function createRestaurantTriples(restaurant: RestaurantEntity): any[] {
    const entityId = restaurant.id;
    const triples = []

    const nameTriple = createTextTriple(entityId, RESTAURANT_NAME_ATTRIBUTE_ID, restaurant.name);

    if (nameTriple)
        triples.push(nameTriple);

    const addressTriple = createTextTriple(entityId, RESTAURANT_ADDRESS_ATTRIBUTE_ID, restaurant.address);

    if (addressTriple)
        triples.push(addressTriple);

    const latitudeTriple = createNumberTriple(entityId, RESTAURANT_LATITUDE_ATTRIBUTE_ID, restaurant.latitude);
    if (latitudeTriple)
        triples.push(latitudeTriple);

    const longitudeTriple = createNumberTriple(entityId, RESTAURANT_LONGITUDE_ATTRIBUTE_ID, restaurant.longitude);
    if (longitudeTriple)
        triples.push(longitudeTriple);

    const statusTriple = createTextTriple(entityId, RESTAURANT_STATUS_ATTRIBUTE_ID, restaurant.status);
    if (statusTriple)
        triples.push(statusTriple);

    const foodItemsTriple = createTextTriple(entityId, RESTAURANT_FOODITEMS_ATTRIBUTE_ID, restaurant.fooditems);
    if (foodItemsTriple)
        triples.push(foodItemsTriple);

    return triples;

}

export function createCuisineTriple(cuisine: CuisineEntity): any {
    return createTextTriple(
        cuisine.id,
        RESTAURANT_NAME_ATTRIBUTE_ID,
        cuisine.name
    )
}

export function createCuisineRelation(restaurantId: string, cuisineId: string): any {
    return createRelation(
        restaurantId,
        CUISINE_RELATION_TYPE_ID,
        cuisineId
    )
}
