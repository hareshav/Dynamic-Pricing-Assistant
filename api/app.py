from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv
from groclake.modellake import ModelLake
from groclake.vectorlake import VectorLake
import uvicorn
from app3 import fetch_product_data, analyze_keywords, run_keyword_analysis
from app2 import vectorize_and_search, get_detailed_analysis, calculate_price_statistics

# Load environment variables
load_dotenv()
os.environ['GROCLAKE_API_KEY'] = os.getenv("GROCLAKE_API_KEY")
os.environ['GROCLAKE_ACCOUNT_ID'] = os.getenv("GROCLAKE_ACCOUNT_ID")
search_api = os.getenv("product_api")

# Initialize FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Initialize ModelLake
modellake = ModelLake()

class ProductAnalysisRequest(BaseModel):
    query: str

class ProductAnalysisResponse(BaseModel):
    product_data: List[Dict[str, Any]]
    price_statistics: Optional[Dict[str, float]]
    search_results: Optional[Dict[str, Any]]
    analysis: Optional[str]

@app.post("/generate_content")
async def generate_content(
    product_details: str = Body(...),
    target_audience: str = Body(...),
    marketing_goal: str = Body(...),
    tone_style: str = Body(...)
):
    if not all([product_details, target_audience, marketing_goal, tone_style]):
        raise HTTPException(status_code=400, detail="All fields must be filled")
    
    prompt = f"""
    You are a marketing expert specializing in AI-driven content generation. Your task is to create compelling, persuasive, and engaging marketing content based on the given product, audience, and goals.

    ### Product Details:
    {product_details}

    ### Target Audience:
    {target_audience}

    ### Marketing Goal:
    {marketing_goal}

    ### Preferred Tone & Style:
    {tone_style}

    ### Content Type:
    Choose from the following:
    - Blog post
    - Social media post (Instagram, LinkedIn, Twitter)
    - Email campaign
    - Ad copy (Google Ads, Facebook Ads)
    - Product description
    - Landing page copy

    📌 **Instructions:**
    - Use attention-grabbing headlines and hooks.
    - Ensure the content is optimized for SEO and engagement.
    - Include a strong CTA (Call-to-Action) to drive action.
    - Make it persuasive, relatable, and easy to read.
    """
    
    chat_completion_request = {
        "groc_account_id": os.getenv("GROCLAKE_ACCOUNT_ID"),
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
    }
    
    try:
        response = modellake.chat_complete(chat_completion_request)
        return {"content": response['answer']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating content: {str(e)}")

@app.post("/analyze")
async def analyze_product(request: ProductAnalysisRequest):
    query = request.query
    
    if not query:
        raise HTTPException(status_code=400, detail="Product query is required")
    
    product_data = fetch_product_data(query)
    price_statistics = calculate_price_statistics(product_data)
    search_results = vectorize_and_search(query, product_data)
    analysis = get_detailed_analysis(search_results, query) if search_results else None
    
    return ProductAnalysisResponse(
        product_data=product_data,
        price_statistics=price_statistics,
        search_results=search_results,
        analysis=analysis
    )

if __name__ == "__main__":
    uvicorn.run(app, port=8000)
