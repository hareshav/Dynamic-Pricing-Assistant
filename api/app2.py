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
from groq import Groq
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)
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
    """Return top 10 items from data without vectorization"""
    try:
        # Simply return the first 10 items from the data list
        top_10_data = data[:10] if len(data) > 10 else data
        
        # Format the result to match the expected structure
        return  [
                {
                    "document_text": item.get("title", ""),
                    "metadata": item,
                    "score": 1.0  # Placeholder score since we're not doing actual similarity scoring
                } for item in top_10_data
            ]
        
    except Exception:
        raise HTTPException(status_code=500, detail="Error processing data")


def get_detailed_analysis(search_results: Dict[str, Any], query: str) -> str:
    """Get detailed analysis using Groq API with llama-3.3-70b-versatile model"""
    prompt = f"""Analyze the following product details and market context to recommend an optimal price.
    ### Market Context: {search_results}
    ### Product Details: {query}
    Consider factors such as competitor pricing, market demand, and product uniqueness while suggesting a competitive and profitable price in Indian rupees."""
    try:
        # Use Groq API with llama-3.3-70b-versatile model
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
        )
        # Extract content from response
        return chat_completion.choices[0].message.content
    except Exception:
        raise HTTPException(status_code=500, detail="Error getting detailed analysis")


def calculate_price_statistics(
    product_data: List[Dict[str, Any]],
) -> Optional[Dict[str, float]]:
    """Calculate price statistics from product data after removing outliers"""
    try:
        df = pd.DataFrame(product_data)
        if "price" in df.columns:
            df["price"] = pd.to_numeric(
                df["price"].astype(str).str.replace("₹", "").str.replace(",", ""), errors="coerce"
            )
            df = df.dropna(subset=["price"])  # Remove NaN values
            
            # Compute IQR
            Q1 = df["price"].quantile(0.25)
            Q3 = df["price"].quantile(0.75)
            IQR = Q3 - Q1
            
            # Define outlier bounds
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Filter out outliers
            df_filtered = df[(df["price"] >= lower_bound) & (df["price"] <= upper_bound)]
            
            if not df_filtered.empty:
                return {
                    "average_price": float(df_filtered["price"].mean()),
                    "minimum_price": float(df_filtered["price"].min()),
                    "maximum_price": float(df_filtered["price"].max()),
                }

    except Exception:
        pass
    return None
