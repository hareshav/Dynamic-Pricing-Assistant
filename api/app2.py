from fastapi import FastAPI, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import requests
import os
import pandas as pd
from dotenv import load_dotenv
from groclake.vectorlake import VectorLake
from groclake.modellake import ModelLake
from groclake.cataloglake import CatalogLake

# Load environment variables
load_dotenv()
API = os.getenv("product_api")
GROCLAKE_API_KEY = os.getenv("GROCLAKE_API_KEY")
GROCLAKE_ACCOUNT_ID = os.getenv("GROCLAKE_ACCOUNT_ID")

# Initialize Groclake credentials
os.environ["GROCLAKE_API_KEY"] = GROCLAKE_API_KEY
os.environ["GROCLAKE_ACCOUNT_ID"] = GROCLAKE_ACCOUNT_ID

# Initialize VectorLake and ModelLake
vectorlake = VectorLake()
modellake = ModelLake()
cataloglake = CatalogLake()


cataloglake_create_payload = {"cataloglake_name": "catalog1"}

groclake_catalog = cataloglake.create(cataloglake_create_payload)



class ProductAnalysisRequest(BaseModel):
    query: str


class ProductAnalysisResponse(BaseModel):
    product_data: List[Dict[str, Any]]
    price_statistics: Optional[Dict[str, float]]
    search_results: Optional[Dict[str, Any]]
    analysis: Optional[str]

def push_into_cataloglake(data: List[Dict[str, Any]]) -> None:
    """Push product data into CatalogLake"""
    for item in data:
        cataloglake.push(
            {
                "cataloglake_id": groclake_catalog.get("cataloglake_id"),
                "document_text": item.get("title", ""),
                "metadata": item,
            }
        )
def fetch_product_data(query: str) -> List[Dict[str, Any]]:
    """Fetch product data from Amazon and Google Shopping"""
    url = "https://www.searchapi.io/api/v1/search"
    sources = [
        {
            "engine": "amazon_search",
            "q": query,
            "amazon_domain": "amazon.in",
            "api_key": API,
        },
        {
            "engine": "google_shopping",
            "q": query,
            "gl": "in",
            "hl": "en",
            "location": "California,United States",
            "api_key": API,
        },
    ]

    product_data = []
    for params in sources:
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            product_data += response.json().get(
                "organic_results", []
            ) + response.json().get("shopping_results", [])
        except requests.exceptions.RequestException:
            continue
    return product_data


def vectorize_and_search(query: str, data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Vectorize product data and perform search"""
    try:
        vectorlake_id = vectorlake.create({"vectorlake_name": query}).get(
            "vectorlake_id"
        )

        for item in data:
            vector = vectorlake.generate(item.get("title", "")).get("vector")
            vectorlake.push(
                {
                    "vector": vector,
                    "vectorlake_id": vectorlake_id,
                    "document_text": item.get("title", ""),
                    "vector_type": "text",
                    "metadata": item,
                }
            )

        search_vector = vectorlake.generate(query).get("vector")
        return vectorlake.search(
            {
                "vector": search_vector,
                "vectorlake_id": vectorlake_id,
                "vector_type": "text",
                "top_k": 20,
            }
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Error in vectorization")


def get_detailed_analysis(search_results: Dict[str, Any], query: str) -> str:
    """Get detailed analysis using ModelLake"""
    prompt = f"""Analyze the following product details and market context to recommend an optimal price.
    ### Market Context: {search_results}
    ### Product Details: {query}
    Consider factors such as competitor pricing, market demand, and product uniqueness while suggesting a competitive and profitable price in Indian rupees."""
    try:
        return modellake.chat_complete(
            {
                "groc_account_id": GROCLAKE_ACCOUNT_ID,
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt},
                ],
            }
        )["answer"]
    except Exception:
        raise HTTPException(status_code=500, detail="Error getting detailed analysis")


def calculate_price_statistics(
    product_data: List[Dict[str, Any]],
) -> Optional[Dict[str, float]]:
    """Calculate price statistics from product data"""
    try:
        df = pd.DataFrame(product_data)
        if "price" in df.columns:
            df["price"] = pd.to_numeric(
                df["price"].str.replace("₹", "").str.replace(",", ""), errors="coerce"
            )
            return {
                "average_price": df["price"].mean(),
                "minimum_price": df["price"].min(),
                "maximum_price": df["price"].max(),
            }
    except Exception:
        pass
    return None
