import React, { useContext } from "react";
import { DataContext } from "../DataContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const Dashboard = () => {
  const { queryResult } = useContext(DataContext);

  if (!queryResult) return <p className="text-center text-white">No data available. Please search on the Home page.</p>;

  const products = queryResult.product_data || [];

  // Grouping Data by Seller
  const sellerStats = products.reduce((acc, product) => {
    const seller = product.seller || "Unknown Seller";
    const price = product.extracted_price || 0;
    const rating = product.rating || 0;

    if (!acc[seller]) {
      acc[seller] = { count: 0, totalPrice: 0, ratings: [] };
    }

    acc[seller].count += 1;
    acc[seller].totalPrice += price;
    acc[seller].ratings.push(rating);

    return acc;
  }, {});

  // Convert object to array and sort by highest values
  const topSellersByProducts = Object.keys(sellerStats)
    .map((seller) => ({ seller, count: sellerStats[seller].count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topSellersByTotalPrice = Object.keys(sellerStats)
    .map((seller) => ({ seller, totalPrice: sellerStats[seller].totalPrice }))
    .sort((a, b) => b.totalPrice - a.totalPrice)
    .slice(0, 10);

  const topPrices = products
    .map((p) => ({ title: p.title.slice(0, 15) + "...", price: p.extracted_price }))
    .sort((a, b) => b.price - a.price)
    .slice(0, 10);

  // Pie Chart Data for extracted_price
  const pieData = topPrices.map((p) => ({
    name: p.title,
    value: p.price,
  }));

  // Pie Chart Data for Ratings
  const ratingStats = products.reduce((acc, product) => {
    const rating = product.rating ? Math.floor(product.rating) : "Unknown";
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});

  const ratingPieData = Object.keys(ratingStats).map((rating) => ({
    name: `Rating ${rating}`,
    value: ratingStats[rating],
  }));

  // Pie Chart Data for Delivery (Free vs. Paid)
  const deliveryStats = products.reduce(
    (acc, product) => {
      if (product.delivery && product.delivery.toLowerCase().includes("free")) {
        acc.free += 1;
      } else {
        acc.paid += 1;
      }
      return acc;
    },
    { free: 0, paid: 0 }
  );

  const deliveryPieData = [
    { name: "Free Delivery", value: deliveryStats.free },
    { name: "Paid Delivery", value: deliveryStats.paid },
  ];

  const COLORS = ["#4ADE80", "#FACC15", "#E879F9", "#38BDF8", "#FB923C", "#A855F7", "#34D399", "#F472B6", "#60A5FA", "#FCD34D"];

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-2xl font-bold my-4 text-white text-center">Product Dashboard</h2>

      {/* Grid Layout for One Bar Chart + One Pie Chart Per Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1️⃣ Top 10 Sellers by Product Count (Bar) + Delivery Info (Pie) */}
        <div>
          <h3 className="text-xl font-semibold my-2 text-white">Top 10 Sellers by Product Count</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSellersByProducts}>
              <CartesianGrid stroke="gray" />
              <XAxis dataKey="seller" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip contentStyle={{ backgroundColor: "#222", color: "#fff", borderRadius: "5px" }} />
              <Bar dataKey="count" fill="#4ADE80" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-xl font-semibold my-2 text-white text-center">Free vs. Paid Delivery</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={deliveryPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {deliveryPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#34D399", "#F87171"][index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "white", color: "#fff", borderRadius: "5px" }} />
              <Legend verticalAlign="bottom" wrapperStyle={{ color: "white" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 2️⃣ Price Distribution (Bar) + Extracted Price Pie Chart */}
        <div>
          <h3 className="text-xl font-semibold my-2 text-white">Top 10 Price Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPrices}>
              <CartesianGrid stroke="gray" />
              <XAxis dataKey="title" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip contentStyle={{ backgroundColor: "#222", color: "#fff", borderRadius: "5px" }} />
              <Bar dataKey="price" fill="#FACC15" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-xl font-semibold  my-2 text-white text-center">Top 10 Products by Price</h3>
          <ResponsiveContainer width="100%" height={350} >
            <PieChart>
              <Pie  data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((entry, index) => (
                  <Cell  key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "white", color: "#fff", borderRadius: "5px" }} />
              <Legend verticalAlign="bottom" wrapperStyle={{ color: "white" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 3️⃣ Total Price per Seller (Bar) + Rating Distribution (Pie) */}
        <div>
          <h3 className="text-xl font-semibold my-2 text-white">Top 10 Sellers by Total Price</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSellersByTotalPrice}>
              <CartesianGrid stroke="gray" />
              <XAxis dataKey="seller" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip contentStyle={{ backgroundColor: "#222", color: "#fff", borderRadius: "5px" }} />
              <Bar dataKey="totalPrice" fill="#E879F9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-xl font-semibold my-2 text-white text-center">Distribution of Ratings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={ratingPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {ratingPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "white", color: "#fff", borderRadius: "5px" }} />
              <Legend verticalAlign="bottom" wrapperStyle={{ color: "white" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
