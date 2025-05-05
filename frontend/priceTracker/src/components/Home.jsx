import React, { useState, useContext, useRef } from 'react';
import Numbers from './Numbers';
import RotatingText from '../RotatingText';
import Analysis from './Analysis';
import { DataContext } from '../DataContext';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const Home = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [price, setPrice] = useState(null);
    const [analyze, setAnalyze] = useState('');
    const [recordingAudio, setRecordingAudio] = useState(false);
    const [error, setError] = useState('');
    const [mediaStream, setMediaStream] = useState(null);
    const { setQueryResult } = useContext(DataContext);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI("AIzaSyD9a-QZILnhna7EEOVETVb-qcSCwitAYoo");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const startAudioRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMediaStream(stream);
            
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            
            mediaRecorderRef.current.start();
            setRecordingAudio(true);
            setError('');
        } catch (err) {
            setError("Failed to access microphone. Please check permissions.");
            console.error("Microphone access error:", err);
        }
    };

    const stopAudioRecording = () => {
        if (mediaRecorderRef.current && recordingAudio) {
            mediaRecorderRef.current.stop();
            setRecordingAudio(false);
            
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await analyzeAudio(audioBlob);
                
                if (mediaStream) {
                    mediaStream.getTracks().forEach(track => track.stop());
                }
            };
        }
    };

    const analyzeAudio = async (audioBlob) => {
        setLoading(true);
        try {
            const base64Audio = await blobToBase64(audioBlob);
            
            const result = await model.generateContent({
                contents: [{
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'audio/webm',
                                data: base64Audio
                            }
                        },
                        { text: "Transcribe this audio and extract only the product name" }
                    ]
                }]
            });

            const analysis = await result.response.text();
            processAnalysis(analysis);
        } catch (err) {
            setError("Failed to analyze audio. Please try again.");
            console.error("Audio analysis error:", err);
        } finally {
            setLoading(false);
        }
    };

    const processAnalysis = (analysis) => {
        setQuery(analysis.trim());
        handleSubmit(analysis.trim());
    };

    const handleSubmit = async (voiceQuery = '') => {
        const searchQuery = voiceQuery || query;
        if (!searchQuery.trim()) {
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
                body: JSON.stringify({ query: searchQuery }),
            });

            if (!res.ok) {
                throw new Error("Error getting response");
            }

            const data = await res.json();
            console.log(data);
            setResults(data.search_results);
            setPrice(data.price_statistics);
            setAnalyze(data.analysis);
            setQueryResult(data);
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
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="hero flex flex-col items-center justify-center gap-4 my-8">
                    <h1 className="text-2xl md:text-6xl text-cyan-400 font-bold text-center">
                        Real-Time Data, Anytime
                    </h1>
                    <div className="m-5 flex items-center gap-2">
                        <p className="text-white text-2xl font-light">
                            Track the prices of the products you want to buy on 
                        </p>
                        <RotatingText
                            texts={['Amazon', 'Flipkart', '& more!']}
                            mainClassName="px-2 sm:px-2 md:px-3 bg-indigo-600 text-white text-xl font-bold overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
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
                    
                    {/* Search Form with Voice Input */}
                    <div className="m-10 flex flex-col sm:flex-row gap-2 sm:gap-4 w-full max-w-md">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Enter the product"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="border border-gray-700 bg-gray-800 p-2 rounded-lg w-full text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                                onClick={recordingAudio ? stopAudioRecording : startAudioRecording}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-700 transition-colors"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                                ) : recordingAudio ? (
                                    <MicOff className="w-5 h-5 text-red-400" />
                                ) : (
                                    <Mic className="w-5 h-5 text-blue-400" />
                                )}
                            </button>

                        </div>
                        <button
                            className="bg-blue-950 px-4 py-2 rounded-lg cursor-pointer text-gray-200 font-semibold hover:bg-blue-900 transition-colors"
                            onClick={() => handleSubmit()}
                        >
                            Search
                        </button>
                    </div>
                    
                    {/* Error Message */}
                    {error && (
                        <div className="text-red-400 mt-2">
                            {error}
                        </div>
                    )}
                    
                    {loading && (
                        <div className="text-cyan-400 mt-4 flex gap-4 items-center">
                            <div className='loader'></div>
                            <span className='font-semibold animate-pulse'>Please wait! Great things take time..</span>
                        </div>
                    )}
                </div>

                {/* Price Statistics */}
                {price && (
                    <div className="mb-8">
                        <Numbers stats={price} />
                    </div>
                )}

                {/* Results and Analysis Section */}
                {(results  &&  analyze) && (
                    <div className="mt-8 flex flex-col lg:flex-row">
                        {/* Products Section */}
                        {results.length > 0 && (
                            <div className={`${analyze ? 'lg:w-2/3' : 'w-full'}`}>
                                <h2 className="text-xl font-bold mb-4 text-zinc-200 px-2">Products:</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pr-0 lg:pr-6">
                                    {results.map((item, index) => (
                                        <div 
                                            key={index} 
                                            className="border border-gray-700 p-4 rounded-lg shadow-md bg-gray-900 hover:bg-gray-800 transform transition-all duration-300 hover:scale-105"
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
                                                View Product 
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Vertical Divider */}
                        {results.length > 0 && analyze && (
                            <div className="hidden lg:block border-l border-gray-700 mx-4"></div>
                        )}

                        {/* Analysis Section */}
                        {analyze && (
                            <div className={`${results.length > 0 ? 'lg:w-1/3 mt-8 lg:mt-0' : 'w-full'}`}>
                                <Analysis analysisText={analyze} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;