# San Francisco Restaurant Data on Geo Browser

## Overview
Our Assignment scrapes restaurant data from San Francisco's Open Data API and publishes it to the Geo Browser testnet using the GRC-20 library. The project demonstrates a complete data pipeline from API scraping to blockchain publication, with a focus on thoughtful data structure design and accuracy.

## Data Structure Design

### Triple-Based Design
The data is modeled using the GRC-20 protocol's triple-based structure. Each triple consists of:
- **Entity**: A unique identifier for a restaurant
- **Attribute**: A characteristic of the restaurant (name, address, cuisine type, etc.)
- **Value**: The specific value for that attribute

I chose this structure after careful consideration of our specific needs. The triple-based approach gives us great flexibility to add new attributes without changing the entire schema. It makes complex queries straightforward - for example, finding all Italian restaurants in North Beach becomes much simpler. The relationships between entities (like connecting restaurants to their cuisine types) create a rich knowledge graph with meaningful semantic connections. This approach also scales well, allowing us to easily incorporate additional data sources in the future if needed.

### Entity-Relationship Model

Below is a simplified representation of the entity-relationship model used:

```
┌───────────────┐              ┌───────────────┐
│  Restaurant   │              │    Cuisine    │
├───────────────┤              ├───────────────┤
│ name          │              │ name          │
│ address       │              │ description   │
│ city          │◄────────────►│ popularity    │
│ state         │  has_cuisine │ origin        │
│ zip_code      │              │               │
│ latitude      │              │               │
│ longitude     │              │               │
│ phone         │              │               │
│ business_id   │              │               │
└───────────────┘              └───────────────┘
```

This model enables:
1. Direct lookups of restaurant properties (name, address, etc.)
2. Finding all restaurants with a specific cuisine
3. Finding all cuisines available at a specific restaurant
4. Geographic queries based on coordinates

### Sample Data Structure

Here's an example of how restaurant data is represented as triples:

```json
// Simple example of restaurant data as triples
{
  "type": "SET_TRIPLE",
  "triple": {
    "entity": "restaurant-123",
    "attribute": "name",
    "value": { "type": "text", "value": "Golden Gate Bakery" }
  }
}

// Relationship example
{
  "type": "CREATE_RELATION",
  "relation": {
    "fromEntity": "restaurant-123",
    "type": "has_cuisine",
    "toEntity": "cuisine-chinese"
  }
}
```

#### Entity Types

We defined multiple entity types:
- `restaurant`: The main entity representing a restaurant
- `cuisine`: Entity representing a cuisine type

#### Attribute IDs

Key attributes include:
- `name`: Restaurant name (text)
- `address`: Street address (text)
- `city`: City name (text)
- `state`: State code (text)
- `zip_code`: Postal code (text)
- `latitude`: Geographic coordinate (number)
- `longitude`: Geographic coordinate (number)
- `phone`: Contact number (text)
- `business_id`: Unique business identifier (text)

### Query Capabilities

The triple-based structure enables powerful queries not possible with traditional data structures:

#### Sample Queries

This data structure enables powerful queries such as:
- Finding all restaurants with a specific cuisine type
- Locating restaurants in a particular neighborhood based on coordinates
- Identifying restaurants with multiple cuisine types
- Discovering the most popular cuisine across all restaurants

These capabilities demonstrate the flexibility and power of the triple-based approach.

### Relations as First-Class Citizens
I made the choice to implement explicit relations between restaurants and cuisine types in our data model. This allowed me to navigate bidirectionally between related entities, handle cases where restaurants offer multiple cuisine types, and efficiently share categories across restaurants. This approach created a more connected and navigable data structure that better represents the real-world relationships between these entities.

### Alternative Approaches Considered

#### Document-Based Structure
I initially considered storing each restaurant as a complete JSON document, which would have been more straightforward to implement. However, I found this approach would make queries for specific attributes less efficient, make it harder to establish relationships between different entities, and lead to redundant storage of shared data like cuisine types.

#### Key-Value Structure
I also evaluated a simpler key-value approach, but ultimately decided against it because it lacks the semantic richness that triples provide. The key-value model wouldn't support the kind of relationship modeling we needed and would have made future extensions to our data model more complicated.

## Data Accuracy Considerations

Data accuracy was a primary concern throughout our development process. I implemented several measures to ensure the quality of our api response. Before processing any restaurant information, I thoroughly inspected and validated the data to catch any anomalies. I used business IDs to deduplicate entries and ensure each restaurant appears only once in our dataset. 

To improve consistency, I standardized cuisine types and other categorical data. For location data, I verified geographic coordinates to ensure mapping accuracy.

## Tech Stack
- TypeScript + Node.js
- grc20-ts (GRC-20 SDK)
- IPFS (via `Ipfs.publishEdit()`)
- Geo Browser Testnet

## Implementation Details

The assignment is organized into several modules:

1. **Scraping**: Fetches data from San Francisco Open Data API
2. **Processing**: Transforms raw data into a structured format
3. **Triple Generation**: Converts structured data into GRC-20 compatible triples
4. **IPFS Publication**: Publishes triples to IPFS for decentralized storage
5. **Geo Testnet Publication**: Registers the IPFS hash on the Geo Browser testnet

### Data Pipeline Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  SF Open    │    │  Transform  │    │  Generate   │    │  Publish    │    │  Publish    │
│  Data API   │ -> │  Data       │ -> │  Triples    │ -> │  to IPFS    │ -> │  to Testnet │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Key Outcomes
- 182 San Francisco restaurants scraped
- 152 unique cuisine types identified
- 2,387 triples generated (attributes and relations)

## Setup and Usage

### Prerequisites

- A wallet with testnet ETH for Geo Testnet deployment
- Geo Testnet Network Configuration in Wallet

### Installation
```bash
git clone <repository-url>
cd geo-browser-assignment
npm install
```

### Configure Environment
Create a `.env` file with:
```
PRIVATE_KEY=your_ethereum_private_key
```

### Run the Pipeline
```bash
# Build the project
npm run build

# Generate triples from restaurant data
npm run start:generate

# Publish to IPFS
npm run start:publish-ipfs

# Publish to Geo Testnet (requires testnet ETH)
npm run start:publish-testnet
```

## Deployment Status

**Note**: The project has been successfully tested with IPFS publication. Deployment to Geo Testnet is pending allocation of testnet ETH from the team. Also, After I get testnet eth, will create my space and after that will deploy to testnet, for now , armando-rss (example-project) space id is hardcoded under geo-testnet-publisher.ts. 

## IPFS Publication Result

The restaurant data has been successfully published to IPFS with the following hash:
```
ipfs://bafkreidtqygtvmo4gkgb34ty5xdsfmutk53qzn54ud574427publagtngi
```

This hash can be used to retrieve the published data from any IPFS gateway.


## Reflections & Challenges Overcome

### Key Learnings
- Deep understanding of GRC-20 triple-based data structures
- Blockchain data publishing workflow via IPFS and Geo Testnet
- Effective modeling of relationship data in graph structures

### Challenges Overcome
- Converting traditional JSON data to GRC-20 compatible triples
- Handling the various GRC-20 triple types (SET_TRIPLE vs CREATE_RELATION)
- Designing entity relationships that maintain referential integrity