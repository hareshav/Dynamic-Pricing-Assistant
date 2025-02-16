import React from "react";
import CountUp from '../CountUp'
const Numbers = ({ stats }) => {
  return (
    <div className="mt-1
    6 p-6 w-full max-w-4xl mx-auto shadow-lg rounded-lg">
      {/* <h2 className="text-2xl font-bold mb-4  text-gray-200">
        Price Statistics
      </h2> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center ">
        <div >
          <p className="text-2xl font-semibold text-cyan-100">Average Price</p>
          <p className=" mt-2 text-4xl font-bold text-orange-500">
            ₹<CountUp
  from={0}
  to={stats.average_price.toFixed(2)}
  separator=","
  direction="up"
  duration={1}
  className="count-up-text"
/>
          </p>
        </div>
        <div >
          <p className=" font-semibold text-cyan-100 text-2xl">Minimum Price</p>
          <p className=" mt-2 text-4xl font-bold text-green-500">
            ₹<CountUp
  from={0}
  to={stats.minimum_price.toFixed(2)}
  separator=","
  direction="up"
  duration={1}
  className="count-up-text"
/>
            
          </p>
        </div>
        <div >
          <p className="text-2xl font-semibold text-cyan-100">Maximum Price</p>
          <p className="mt-2 text-4xl font-bold text-red-500">
            ₹<CountUp
  from={0}
  to={stats.maximum_price.toFixed(2)}
  separator=","
  direction="up"
  duration={1}
  className="count-up-text"
/>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Numbers;
