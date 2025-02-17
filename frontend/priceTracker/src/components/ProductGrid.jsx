import React, { useContext } from "react";
import { DataContext } from "../DataContext";

const ProductGrid = () => {
  const { queryResult } = useContext(DataContext);

  if (!queryResult) return <p className="text-gray-300 text-center">No products found. Please search on the home page.</p>;

  const products = queryResult.product_data || [];

  return (
    <div className="p-6">
      <h2 className="text-xxl md:text-4xl text-cyan-400 font-bold  m-10">👜 All Products listed here :</h2>

      {products.length === 0 ? (
        <p className="text-gray-300">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {products.map((product, index) => (
            <div
              key={index}
              className="border border-gray-700 p-4 rounded-lg shadow-md bg-gray-900 hover:bg-gray-800 transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative mb-4 h-40 bg-white rounded overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <h3 className="text-lg font-semibold text-white line-clamp-2 h-12">
                {product.title}
              </h3>

              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-300">
                    Price: <span className="font-bold text-cyan-300">{product.price}</span>
                  </p>
                  {product.original_price && (
                    <p className="text-gray-400 line-through">{product.original_price}</p>
                  )}
                </div>

                {product.rating && (
                  <p className="text-gray-400 flex items-center">
                    Rating: <span className="ml-1">{product.rating}</span>
                    <span className="text-yellow-400 ml-1">⭐</span>
                    {product.reviews && (
                      <span className="ml-2 text-sm">({product.reviews} reviews)</span>
                    )}
                  </p>
                )}

                {product.fulfillment?.standard_delivery && (
                  <p className="text-green-400 text-sm">
                    {product.fulfillment.standard_delivery.text}
                  </p>
                )}

                {product.availability && (
                  <p className="text-red-400 text-sm">{product.availability}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  {product.is_prime && (
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">Prime</span>
                  )}
                  {product.is_limited_time_deal && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">Limited Deal</span>
                  )}
                  {product.is_sponsored && (
                    <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Sponsored</span>
                  )}
                </div>
              </div>

              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                View Product 
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
