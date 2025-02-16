import os
import re
import requests
from typing import List, Dict, Any
from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from fastapi import HTTPException

# Download required NLTK data if not available
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

# Set stop words globally
STOP_WORDS = set(stopwords.words('english'))

# API Key (Move to .env for security in production)
API_KEY = os.getenv("product_api")


def fetch_product_data(query: str) -> List[Dict[str, Any]]:
    """Fetch product data from multiple sources with retry mechanism"""
    url = "https://www.searchapi.io/api/v1/search"
    params_list = [
        {"engine": "amazon_search", "q": query, "amazon_domain": "amazon.in", "api_key": API_KEY},
        {"engine": "google_shopping", "q": query, "gl": "in", "hl": "en", "api_key": API_KEY}
    ]
    
    products = []
    for params in params_list:
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            products.extend(data.get("organic_results", []) + data.get("shopping_results", []))
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data: {e}")
            continue  # Continue fetching other sources if one fails
    
    return products


def preprocess_text(text: str) -> List[str]:
    """Cleans and tokenizes text, removing stopwords & special characters"""
    text = re.sub(r'[^\w\s]', ' ', text.lower())  # Remove special characters
    text = re.sub(r'\d+', ' ', text)  # Remove numbers
    tokens = word_tokenize(text)
    return [word for word in tokens if word not in STOP_WORDS and len(word) > 2]


def analyze_keywords(products: List[Dict[str, Any]], query: str) -> Dict:
    """Extracts and analyzes keyword trends from product titles & descriptions"""
    all_text = " ".join([
        product.get('title', product.get('name', '')) + " " +
        product.get('description', product.get('snippet', ''))
        for product in products
    ])

    filtered_tokens = preprocess_text(all_text)
    word_freq = Counter(filtered_tokens)
    top_keywords = word_freq.most_common(20)

    prices = [
        float(re.sub(r'[^\d.]', '', str(product.get('price', product.get('price_value', '0')))))
        for product in products if product.get('price')
    ]
    avg_price = sum(prices) / len(prices) if prices else None

    brand_freq = Counter([
        product.get('brand', '').lower() for product in products if product.get('brand')
    ]).most_common(5)

    keyword_insights = get_keyword_insights(top_keywords, query)

    return {
        "total_products": len(products),
        "top_keywords": top_keywords,
        "average_price": avg_price,
        "top_brands": brand_freq,
        "keyword_insights": keyword_insights,
        "query": query
    }


def get_keyword_insights(top_keywords: List[tuple], query: str) -> List[str]:
    """Generates marketing insights from keyword trends"""
    insights = []
    query_terms = query.lower().split()

    descriptor_terms = {'best', 'premium', 'cheap', 'affordable', 'luxury', 'wireless', 'smart'}
    size_terms = {'small', 'large', 'medium', 'mini', 'compact', 'tall', 'wide'}
    material_terms = {'leather', 'plastic', 'metal', 'cotton', 'wood', 'glass', 'steel'}

    missing_terms = [term for term in query_terms if term not in dict(top_keywords)]
    if missing_terms:
        insights.append(f"Query terms missing from top results: {', '.join(missing_terms)}")

    found_descriptors = [term for term, _ in top_keywords if term in descriptor_terms]
    found_sizes = [term for term, _ in top_keywords if term in size_terms]
    found_materials = [term for term, _ in top_keywords if term in material_terms]

    if found_descriptors:
        insights.append(f"Common product descriptors: {', '.join(found_descriptors)}")
    if found_sizes:
        insights.append(f"Popular size terms: {', '.join(found_sizes)}")
    if found_materials:
        insights.append(f"Trending materials: {', '.join(found_materials)}")

    return insights


def run_keyword_analysis(query: str) -> Dict:
    """Runs the full keyword analysis pipeline"""
    products = fetch_product_data(query)
    return analyze_keywords(products, query)
