import React, { useState } from "react";
import Stepper, { Step } from "../Stepper";

const AIGen = () => {
  const [formData, setFormData] = useState({
    product_details: "",
    target_audience: "",
    marketing_goal: "",
    tone_style: "",
  });

  const [responseContent, setResponseContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/generate_content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setResponseContent(data.content || "No response received.");
    } catch (error) {
      setResponseContent("Error fetching response. Please try again.");
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const formatContent = (content) => {
    if (!content) return "Your AI-generated content will appear here.";
  
    return content.split("\n").map((line, index) => {
      if (line.startsWith("### ")) {
        return (
          <h2 key={index} className="text-xl font-bold text-cyan-400 mb-3">
            {line.replace("### ", "")}
          </h2>
        );
      }
      if (line.startsWith("**Title:**")) {
        return (
          <h3 key={index} className="text-lg font-semibold text-blue-400 mb-2">
            {line.replace("**Title:**", "Title:")}
          </h3>
        );
      }
      if (line.trim() === "") {
        return <br key={index} />;
      }
      return <p key={index} className="text-gray-300 mb-2">{line}</p>;
    });
  };
  

  return (
    <div className="min-h-screen text-white ">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">AI Marketing Content Generator</h2>
          <p className="text-gray-400">
            Generate compelling marketing content in minutes
          </p>
        </div>

        <div className=" rounded-xl p-6 shadow-xl">
          <Stepper
            initialStep={1}
            onStepChange={(step) => console.log(step)}
            onFinalStepCompleted={handleSubmit}
            backButtonText="Previous"
            nextButtonText="Next"
          >
            <Step>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Enter Product Details</h2>
                <p className="text-gray-400">
                  Describe your product's key features and benefits
                </p>
                <input
                  name="product_details"
                  value={formData.product_details}
                  onChange={handleChange}
                  placeholder="Describe your product..."
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:border-transparent transition duration-200"
                />
              </div>
            </Step>

            <Step>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Define Your Target Audience
                </h2>
                <p className="text-gray-400">Who is your ideal customer?</p>
                <input
                  name="target_audience"
                  value={formData.target_audience}
                  onChange={handleChange}
                  placeholder="Who is this for?"
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:border-transparent transition duration-200"
                />
              </div>
            </Step>

            <Step>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Set Your Marketing Goal
                </h2>
                <p className="text-gray-400">
                  What do you want to achieve with this content?
                </p>
                <input
                  name="marketing_goal"
                  value={formData.marketing_goal}
                  onChange={handleChange}
                  placeholder="What do you want to achieve?"
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:border-transparent transition duration-200"
                />
              </div>
            </Step>

            <Step>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Choose a Tone & Style</h2>
                <p className="text-gray-400">
                  Select the voice that best fits your brand
                </p>
                <input
                  name="tone_style"
                  value={formData.tone_style}
                  onChange={handleChange}
                  placeholder="E.g., Professional, Casual, Persuasive..."
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:border-transparent transition duration-200"
                />
              </div>
            </Step>

            <Step>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Review & Generate</h2>
                <p className="text-gray-400">
                  Click "Next" to generate your marketing content
                </p>
              </div>
            </Step>
          </Stepper>
        </div>

        {/* Response Section with Formatted Content */}
        <div className="bg-black rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold mb-4">Generated Content:</h3>
          <div className="rounded-lg bg-gray-900 p-6">
            {loading ? (
              <div className="flex justify-center">
                <p className="text-yellow-400 animate-pulse">
                  Generating content...
                </p>
              </div>
            ) : (
              <div className="space-y-2">{formatContent(responseContent)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGen;
