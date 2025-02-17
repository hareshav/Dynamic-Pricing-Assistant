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

  const InputField = ({ name, value, placeholder }) => (
    <input
      name={name}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:border-transparent transition duration-200"
    />
  );

  // Function to format the content
  const formatContent = (content) => {
    if (!content) return "Your AI-generated content will appear here.";

    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Check for Blog Post header
      if (line.startsWith('### Blog Post:')) {
        return <h1 key={index} className="text-2xl font-bold mb-4">{line.replace('### Blog Post:', 'Blog Post')}</h1>;
      }
      // Check for Title
      if (line.startsWith('**Title:**')) {
        return (
          <h2 key={index} className="text-xl font-bold mb-4">
            {line.replace('**Title:**', 'Title: ')}
          </h2>
        );
      }
      // Regular paragraph
      return <p key={index} className="text-gray-300 mb-2">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">AI Marketing Content Generator</h2>
          <p className="text-gray-400">Generate compelling marketing content in minutes</p>
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
                <p className="text-gray-400">Describe your product's key features and benefits</p>
                <InputField
                  name="product_details"
                  value={formData.product_details}
                  placeholder="Describe your product..."
                />
              </div>
            </Step>

            <Step>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Define Your Target Audience</h2>
                <p className="text-gray-400">Who is your ideal customer?</p>
                <InputField
                  name="target_audience"
                  value={formData.target_audience}
                  placeholder="Who is this for?"
                />
              </div>
            </Step>

            <Step>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Set Your Marketing Goal</h2>
                <p className="text-gray-400">What do you want to achieve with this content?</p>
                <InputField
                  name="marketing_goal"
                  value={formData.marketing_goal}
                  placeholder="What do you want to achieve?"
                />
              </div>
            </Step>

            <Step>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Choose a Tone & Style</h2>
                <p className="text-gray-400">Select the voice that best fits your brand</p>
                <InputField
                  name="tone_style"
                  value={formData.tone_style}
                  placeholder="E.g., Professional, Casual, Persuasive..."
                />
              </div>
            </Step>

            <Step>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Review & Generate</h2>
                <p className="text-gray-400">Click "Next" to generate your marketing content</p>
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
                <p className="text-yellow-400 animate-pulse">Generating content...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {formatContent(responseContent)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGen;