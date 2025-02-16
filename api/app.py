from fastapi import FastAPI, HTTPException, Body
from groclake.modellake import ModelLake
from fastapi import FastAPI, HTTPException, Body, Query
from typing import List, Dict, Any, Counter
from app3 import fetch_product_data, preprocess_text, analyze_keywords,run_keyword_analysis
from app2 import vectorize_and_search, get_detailed_analysis, calculate_price_statistics
import os
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import requests
import os
from groclake.vectorlake import VectorLake
from groclake.modellake import ModelLake
import pandas as pd
from dotenv import load_dotenv
import uvicorn

def run_keyword_analysis(query: str) -> Dict:
    """Runs the full keyword analysis pipeline"""
    products = fetch_product_data(query)
    return analyze_keywords(products, query)
class ProductAnalysisRequest(BaseModel):
    query: str

class ProductAnalysisResponse(BaseModel):
    product_data: List[Dict[str, Any]]
    price_statistics: Optional[Dict[str, float]]
    search_results: Optional[Dict[str, Any]]
    analysis: Optional[str]

# Set environment variables
os.environ['GROCLAKE_API_KEY'] = os.getenv("GROCLAKE_API_KEY")
os.environ['GROCLAKE_ACCOUNT_ID'] = os.getenv("GROCLAKE_ACCOUNT_ID")
search_api=os.getenv("product_api")
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

# API endpoint for generating content
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

    Generate the best-performing marketing content with high conversion potential.
    """
    
    chat_completion_request = {
        "groc_account_id": "c4ca4238a0b923820dcc509a6f75849b",
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
# @app.get("/keyword-analysis")
# def keyword_analysis(query: str = Query(..., title="Search Query")) :
#     """API endpoint for running keyword analysis."""
#     result = run_keyword_analysis(query)
#     return result


@app.post("/analyze")
async def analyze_product(request: ProductAnalysisRequest):
    query = request.query
    
    if not query:
        raise HTTPException(status_code=400, detail="Product query is required")
    
    # Fetch product data
    product_data = fetch_product_data(query)
    
    # Calculate price statistics
    price_statistics = calculate_price_statistics(product_data)
    
    # Vectorize and search
    search_results = vectorize_and_search(query, product_data)
    
    # Get detailed analysis
    analysis = None
    if search_results:
        analysis = get_detailed_analysis(search_results, query)
    
    return ProductAnalysisResponse(
        product_data=product_data,
        price_statistics=price_statistics,
        search_results=search_results,
        analysis=analysis
    )



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app,  port=8000)