import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Check } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";

// Use the local worker with Vite's worker import support
import PdfWorker from "pdfjs-dist/build/pdf.worker.mjs?worker";

let workerUrl: string;
if (typeof window !== 'undefined') {
  const worker = new PdfWorker();
  workerUrl = worker.toString();
  GlobalWorkerOptions.workerSrc = workerUrl;
}

const Step2: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!validTypes.includes(file.type) && !["pdf", "doc", "docx"].includes(fileExtension || "")) {
      alert("Please upload a PDF or DOCX file.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a resume file.");
    if (!user) return alert("Please sign in again before uploading.");

    setIsUploading(true);
    try {
      const jobRequestId = localStorage.getItem("current_job_request_id");
      if (!jobRequestId) throw new Error("Missing job request ID (Step 1 not saved).");

      const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();

      const firstName =
  localStorage.getItem("first_name") ||
  (user && (user as any)?.user_metadata?.full_name?.split(" ")[0]) ||
  "user";


      const cleanFirstName = firstName.trim().replace(/\s+/g, "_").toLowerCase();
      const fileName = `${cleanFirstName}_careercast_resume.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 🔹 Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, selectedFile, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from("resumes").getPublicUrl(filePath);
      const publicUrl = publicData?.publicUrl ?? null;

      // 🔹 Extract text
      let extractedText = "";
      const buffer = await selectedFile.arrayBuffer();

      if (fileExt === "pdf") {
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;
        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(" ");
          text += pageText + " ";
        }
        extractedText = text;
      } else if (["docx", "doc"].includes(fileExt || "")) {
        const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
        extractedText = value;
      }

      extractedText = extractedText.replace(/\s+/g, " ").trim().slice(0, 10000);

      // 🔹 Save to localStorage
      localStorage.setItem("uploadedResumeUrl", publicUrl || "");
      localStorage.setItem("resumeFileName", fileName);
      localStorage.setItem("resumeFullText", extractedText);

      // 🔹 Update Supabase
      const { error: updateError } = await supabase
        .from("job_requests")
        .update({
          resume_path: publicUrl,
          resume_original_name: fileName,
          status: "ready",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobRequestId);

      if (updateError) throw updateError;

      alert("✅ Resume uploaded and text extracted successfully!");
      navigate("/step3");
    } catch (err: any) {
      console.error("❌ Upload failed:", err.message);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-6 relative px-8">
            <div className="absolute top-4 left-16 right-16 h-0.5 bg-gray-300 -z-10">
              <div className="h-full bg-green-500 w-1/2"></div>
            </div>

            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-xs mt-1 text-green-600 font-medium">Job Details</span>
            </div>

            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-xs mt-1 text-blue-600 font-medium">Upload Resume</span>
            </div>

            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-xs mt-1 text-gray-500">Record Video</span>
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-center">Upload Your Resume</CardTitle>
          <p className="text-gray-600 text-center mt-2">
            Upload your resume in PDF or DOCX format
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
              } ${!selectedFile ? "min-h-[200px] flex items-center justify-center" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {!selectedFile ? (
                <div>
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">PDF or DOCX (max 10MB)</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <p className="text-lg font-medium text-gray-700 mb-2">Resume Selected</p>
                  <p className="text-sm text-gray-500">Ready to proceed to next step</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInputChange}
              />
            </div>

            {selectedFile && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-4 mt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{selectedFile.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type || "Document"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-red-600 text-sm hover:text-red-800 transition-colors"
                    onClick={removeFile}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/step1")}
                disabled={isUploading}
              >
                Back
              </Button>
              <Button type="submit" disabled={!selectedFile || isUploading} className="min-w-[120px]">
                {isUploading ? "Uploading..." : "Next Step →"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step2;
