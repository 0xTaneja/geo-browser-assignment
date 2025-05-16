export const RESTAURANT_NAME_ATTRIBUTE_ID = "sfRestaurantNameAttribute";
export const RESTAURANT_ADDRESS_ATTRIBUTE_ID = "sfRestaurantAddressAttribute";
export const RESTAURANT_LATITUDE_ATTRIBUTE_ID = "sfRestaurantLatitudeAttribute";
export const RESTAURANT_LONGITUDE_ATTRIBUTE_ID = "sfRestaurantLongitudeAttribute";
export const RESTAURANT_STATUS_ATTRIBUTE_ID = "sfRestaurantStatusAttribute";
export const RESTAURANT_FOODITEMS_ATTRIBUTE_ID = "sfRestaurantFoodItemsAttribute";

export const CUISINE_RELATION_TYPE_ID = "servesTypeOfCuisineRelation";

export const RESTAURANT_TYPE_ID = "sfRestaurantEntityType";

export const CUISINE_TYPE_ID = "cuisineTypeEntity";

export interface RestaurantEntity {

    id:string;
    name:string;
    address:string;
    latitude:string | number;
    longitude:string | number;
    status: string;
    fooditems:string;
}

export interface CuisineEntity {

    id:string;
    name:string;
}

export function formatRestaurantEntity(restaurant:any,entityId:string):RestaurantEntity{
    return {
        id:entityId,
        name:restaurant.businessName,
        address:restaurant.address,
        latitude:restaurant.location.latitude,
        longitude:restaurant.location.longitude,
        status:restaurant.status,
        fooditems:restaurant.fooditems
    };

}

export function parseCuisineTypes(fooditems:string):string[]{
    if(!fooditems) return [];
    
    const items = fooditems.split(/:|,/)
                  .map(item => item.trim())
                 .filter(item=>item.length > 0 && !item.match(/^\d+$/));

    return [...new Set(items)];

}