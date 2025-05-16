import axios from "axios";
import fs from "fs";
import path from "path"
import dotenv from "dotenv"

dotenv.config()

const apiUrl = "https://data.sfgov.org/resource/rqzj-sfat.json";

const DATA_FILE = path.join(__dirname,'../../data/sf_restaurants.json')

interface Restaurant {
  businessName: string;
  address: string;
  location: {
    latitude : number;
    longitude: number;

  };
  fooditems: string;
  status:string;
  zipcode: string;
  neighborhood: string;

}

interface SFRestaurantData {
applicant: string;
address :  string;
location?:{
    latitude: number;
    longitude: number;
}
fooditems?: string;
status:string;
zipcode?:string;
neighborhoods?:string[];

}

async function fetchAllRestaurants() : Promise<SFRestaurantData[]> {
    try{
    const response = await axios.get(apiUrl,{
        params:{
            $limit:1000,
            $where:"status='APPROVED'"
        }
    });

    return response.data;
    }
    catch(error){
    console.error("Error Fetchung Restaurant Data ",error);
    return [];
    }
}

function transformRestaurantData(data:SFRestaurantData[]): Restaurant[]{
    return data.map(item=>{
        return {
            businessName:item.applicant || 'Unknown',
            address:item.address || 'Unknown',
            location :{
                latitude:item.location?.latitude || 0,
                longitude:item.location?.longitude || 0
            },
            fooditems:item.fooditems || '',
            status: item.status,
            zipcode:item.zipcode || '',
            neighborhood: item.neighborhoods?.[0] || 'Unknown'
        };
    });
}

async function saveRestaurantData(restaurants:Restaurant[]): Promise<void> {
    try{
        await fs.promises.mkdir(path.dirname(DATA_FILE),{recursive:true});

        await fs.promises.writeFile(
            DATA_FILE,
            JSON.stringify(restaurants,null,2),
            'utf-8'
        );
        console.log('✅ Restaurant data saved to', DATA_FILE);
    }
    catch(error){
        console.log('Failed to save restaurant data to', DATA_FILE);
        console.error(error);
    }
}

async function runScraper() {
    try{
        console.log('📡 Fetching restaurant data from SF Open Data...');
        const rawrestaurants = await fetchAllRestaurants();
        console.log(`✅ Retrieved ${rawrestaurants.length} restaurants from API`);
    
        console.log('🔄 Transforming restaurant data...');
        const restaurants = transformRestaurantData(rawrestaurants);
        
        if(restaurants.length > 0) {
            console.log('📝 Sample restaurant:');
            console.log(restaurants[0])
        }
        await saveRestaurantData(restaurants);
    }
    catch(error){
        console.error('❌ Error running scraper:', error);
    }
}

runScraper();