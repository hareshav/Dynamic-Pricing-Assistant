import React, { useState } from 'react';
import Numbers from './Numbers';
import RotatingText from '../RotatingText'

const Home = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [price, setPrice] = useState(null);

    const handleSubmit = async () => {
        if (!query.trim()) {
            alert("Please enter a product name.");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) {
                throw new Error("Error getting response");
            }

            const data = await res.json();
            setResults(data.search_results.results);
            setPrice(data.price_statistics);
        } catch (e) {
            console.error("Error fetching data:", e);
            alert("Failed to fetch data. Please try again.");
        } finally {
            setLoading(false);
            setQuery('');
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-6 bg-black text-gray-100">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center gap-4 my-8">
                    <h1 className="text-2xl md:text-5xl text-fuchsia-400 font-semibold text-center">
                       🚀 Real-Time Data, Anytime

                    </h1>
                    <div className=" m-5 flex items-center gap-2">
    <p className="text-violet-100 text-2xl">
        Track the prices of the products you want to buy on 
    </p>
    <RotatingText
        texts={['Amazon', 'Flipkart', '& more!']}
        mainClassName="px-2 sm:px-2 md:px-3 bg-fuchsia-200 text-black font-semibold overflow-hidden py-0.5 sm:py-1 md:py-2 
                       justify-center rounded-lg"
        staggerFrom="last"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "-120%" }}
        staggerDuration={0.025}
        splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        rotationInterval={2000}
    />
</div>
                    
                    {/* Search Form */}
                    <div className=" m-10 flex flex-col sm:flex-row gap-2 sm:gap-4 w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Enter the product"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="border border-gray-700 bg-gray-800 p-2 rounded-lg w-full text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <button
                            className="bg-blue-950 px-4 py-2 rounded-lg cursor-pointer text-gray-200 font-semibold hover:bg-blue-900 transition-colors"
                            onClick={handleSubmit}
                        >
                            Search
                        </button>
                    </div>
                    
                    {loading && (
                        <div className="text-blue-400 mt-4 flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Searching...</span>
                        </div>
                    )}
                </div>

                {/* Price Statistics */}
                {price && (
                    <div className="mb-8">
                        <Numbers stats={price} />
                    </div>
                )}

                {/* Search Results */}
                {results.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4 text-zinc-200 px-2">Search Results:</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {results.map((item, index) => (
                                <div 
                                    key={index} 
                                    className="border border-gray-700 p-4 rounded-lg  shadow:md bg-gray-900 hover:bg-gray-750  transform transition-all duration-300 hover:scale-105"
                                >
                                    <div className="relative mb-4 h-40 bg-white rounded overflow-hidden">
                                        <img 
                                            src={item.metadata.thumbnail} 
                                            alt={item.metadata.title} 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold line-clamp-2 h-12">
                                        {item.metadata.title}
                                    </h3>
                                    <p className="text-gray-300 mt-2">
                                        Price: <span className="font-bold text-cyan-300">{item.metadata.price}</span>
                                    </p>
                                    {item.metadata.seller && (
                                        <p className="text-gray-400 mt-1">
                                            Seller: {item.metadata.seller}
                                        </p>
                                    )}
                                    {item.metadata.rating && (
                                        <p className="text-gray-400 mt-1 flex items-center">
                                            Rating: <span className="ml-1">{item.metadata.rating}</span>
                                            <span className="text-yellow-400 ml-1">⭐</span>
                                        </p>
                                    )}
                                    <a
                                        href={item.metadata.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block mt-3 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                                    >
                                        View Product →
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;