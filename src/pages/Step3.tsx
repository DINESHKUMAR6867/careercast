import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Check, Loader2, AlertCircle } from "lucide-react";

// ✅ real GPT endpoint
// Handle both Vercel and local environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

const Step3: React.FC = () => {
  const navigate = useNavigate();
  const [teleprompterText, setTeleprompterText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----------- GPT PROMPT FUNCTION -------------
  const callOpenAI = async (prompt: string): Promise<string> => {
    // For Vercel deployment, use the backend API endpoint instead of calling OpenAI directly from frontend
    if (process.env.NODE_ENV === 'production') {
      console.log('📤 Sending request to /api/generate-introduction');
      console.log('📤 Prompt length:', prompt.length);
      console.log('📤 Prompt preview:', prompt.substring(0, 100) + '...');
      
      // Prepare the request body
      const requestBody = { prompt };
      console.log('📤 Request body type:', typeof requestBody);
      console.log('📤 Request body keys:', Object.keys(requestBody));
      
      // In production, call our own backend endpoint
      const response = await fetch("/api/generate-introduction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('📥 Response text:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.error('API Error Response:', errorData);
          throw new Error(`Failed to generate introduction: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        } catch (e) {
          throw new Error(`Failed to generate introduction: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }
      
      const data = await response.json();
      console.log('📥 Response data:', data);
      return data.introduction;
    } else {
      // In development, call OpenAI directly
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // or "gpt-4-turbo"
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 350,
        }),
      });

      if (!response.ok) throw new Error("Failed to reach OpenAI API");
      const data = await response.json();
      return data.choices[0].message.content.trim();
    }
  };

  // ------------- PROMPT BUILDER ----------------
  const buildPrompt = (jobTitle: string, jobDescription: string, resumeText: string) => `
You are an expert HR assistant. Write a *polite, professional, legally appropriate*
self-introduction video script for a candidate applying for the position of **${jobTitle}**.

Use the information below:

📋 Job Description:
${jobDescription}

📄 Candidate Resume Text:
${resumeText}

✍️ Instructions:
- Duration ≈ 45–60 seconds (≈ 120–150 words)
- Begin with a warm, professional greeting (e.g., “Hello, my name is …”)
- Mention the ${jobTitle} role naturally.
- Highlight the candidate’s strongest, most relevant experience.
- Keep it confident, humble, and human (not robotic).
- Avoid disclosing personal information beyond [Your Name].
- End with enthusiasm about the opportunity and gratitude.

Format as plain text (no Markdown). 
`;

  // ----------- GENERATE INTRO ------------------
  const generateIntroduction = async (rewrite = false) => {
    try {
      rewrite ? setIsRewriting(true) : setIsGenerating(true);
      setError(null);

      const jobTitle = localStorage.getItem("careerCast_jobTitle") || "";
      const jobDescription = localStorage.getItem("careerCast_jobDescription") || "";
      const resumeText = localStorage.getItem("resumeFullText") || "Resume text not found.";

      if (!jobTitle || !jobDescription) {
        throw new Error("Missing job title or description. Please complete Step 1 and 2 first.");
      }

      const prompt = buildPrompt(jobTitle, jobDescription, resumeText);
      const result = await callOpenAI(prompt);

      setTeleprompterText(result);
      localStorage.setItem("teleprompterText", result);
    } catch (err) {
      console.error("❌ Error generating introduction:", err);
      setError(err instanceof Error ? err.message : "Something went wrong while generating.");
    } finally {
      setIsGenerating(false);
      setIsRewriting(false);
    }
  };

  // -------- INITIALIZE ON MOUNT ---------------
  useEffect(() => {
    const saved = localStorage.getItem("teleprompterText");
    const jobTitle = localStorage.getItem("careerCast_jobTitle");
    if (saved && jobTitle) setTeleprompterText(saved);
    else if (jobTitle) generateIntroduction();
    else {
      setError("Please complete Step 1 (Job Details) first.");
      setTeleprompterText(
        "Please go back to Step 1 and provide job details to generate your personalized introduction."
      );
    }
  }, []);

  // -------------- RECORD & FINISH --------------
  const handleStartRecording = () => {
    if (!teleprompterText || teleprompterText.includes("Please go back")) {
      alert("Wait for AI to generate your script first.");
      return;
    }
    localStorage.setItem("teleprompterText", teleprompterText);
    const castId = `career_cast_${Date.now()}`;
    localStorage.setItem("current_cast_id", castId);
    navigate("/record");
  };

  const handleFinish = () => {
    if (!teleprompterText) {
      alert("Generate a valid introduction before finishing.");
      return;
    }
    alert("CareerCast completed! Redirecting to dashboard.");
    navigate("/dashboard");
  };

  // -------------- UI ---------------------------
  const jobTitle = localStorage.getItem("careerCast_jobTitle") || "Your Position";
  const resumeFileName = localStorage.getItem("resumeFileName") || "No resume uploaded";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          {/* Progress bar */}
          <div className="flex justify-between items-center mb-6 relative px-8">
            <div className="absolute top-4 left-16 right-16 h-0.5 bg-gray-300 -z-10">
              <div className="h-full bg-green-500 w-2/3" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-xs mt-1 text-green-600 font-medium">Job Details</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-xs mt-1 text-green-600 font-medium">Upload Resume</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                3
              </div>
              <span className="text-xs mt-1 text-blue-600 font-medium">Record Video</span>
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-center">
            Record Your CareerCast Video
          </CardTitle>
          <div className="text-center text-gray-600 mt-2">
            Job Title: <span className="font-semibold">{jobTitle}</span>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left – Video */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">🎥</span> Video Recording
              </h3>

              <div className="bg-gray-100 rounded-lg p-6 text-center mb-4 border border-gray-200">
                <div className="bg-gray-300 rounded-lg h-48 flex items-center justify-center mb-4">
                  <div>
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-600">Camera preview appears here</p>
                  </div>
                </div>

                <Button
                  onClick={handleStartRecording}
                  className="w-full"
                  disabled={isGenerating || !teleprompterText}
                >
                  <span className="mr-2">⏺️</span>
                  {isGenerating ? "Generating Script..." : "Start Recording"}
                </Button>

                <p className="text-sm text-gray-600 mt-3">
                  Opens the recording studio with teleprompter
                </p>
              </div>
            </div>

            {/* Right – Teleprompter */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">📜</span> Teleprompter
                {(isGenerating || isRewriting) && (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin text-blue-600" />
                )}
              </h3>

              <div className="bg-gray-900 text-white rounded-lg p-4 h-64 overflow-y-auto mb-4 font-mono text-sm">
                {isGenerating || isRewriting ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
                      <p className="text-gray-300">
                        {isRewriting
                          ? "Rewriting your introduction..."
                          : "Generating your personalized introduction..."}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Analyzing job and resume data
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed text-gray-100">
                    {teleprompterText}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => generateIntroduction(true)}
                className="w-full"
                disabled={isRewriting || isGenerating}
              >
                {isRewriting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rewriting...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🔄</span> Regenerate / Rewrite
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/step2")}
              disabled={isGenerating}
            >
              Back
            </Button>
            <Button
              onClick={handleFinish}
              disabled={isGenerating || !teleprompterText}
            >
              Finish & Save CareerCast
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step3;
