import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Download, Play, ArrowLeft, LogOut } from "lucide-react";
import { useAuthContext } from "../contexts/AuthContext";
import { PDFDocument, PDFName, PDFNumber, PDFArray, PDFString } from "pdf-lib";

const FinalResult: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const { castId } = useParams<{ castId: string }>();

  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>("Resume.pdf");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // ✅ Load data from localStorage
  useEffect(() => {
    const uploadedResumeUrl = localStorage.getItem("uploadedResumeUrl");
    const fileName = localStorage.getItem("resumeFileName");
    const recordedVideoUrl = localStorage.getItem("recordedVideoUrl");

    if (uploadedResumeUrl) setResumeUrl(uploadedResumeUrl);
    if (fileName) setResumeFileName(fileName);
    if (recordedVideoUrl) setVideoUrl(recordedVideoUrl);

    console.log("🎬 Loaded data:", {
      uploadedResumeUrl,
      recordedVideoUrl,
      fileName,
    });
  }, []);

  const handlePlayVideo = () => {
    if (!videoUrl) {
      alert("No recorded video found for this profile.");
      return;
    }
    setShowVideoPlayer(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ✅ Enhance PDF with embedded clickable Play Video button
  const enhancePDF = async (resumeUrl: string, castId: string) => {
    try {
      const baseUrl = window.location.origin;
      const finalResultUrl = `${baseUrl}/final-result/${castId || "profile"}`;
      console.log("🎯 Embedding link →", finalResultUrl);

      // Load the existing PDF
      const existingPdfBytes = await fetch(resumeUrl, { mode: "cors" }).then((res) =>
        res.arrayBuffer()
      );

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const firstPage = pdfDoc.getPages()[0];
      const { width, height } = firstPage.getSize();

      // Load play button image (must exist in /public/images)
      const imagePath = `${baseUrl}/images/play_video_button.png`;
      const imageResponse = await fetch(imagePath);
      if (!imageResponse.ok) throw new Error(`Button image not found at ${imagePath}`);

      const imageBytes = await imageResponse.arrayBuffer();
      const playButtonImage = await pdfDoc.embedPng(imageBytes);

      // Button position
      const buttonWidth = 140;
      const buttonHeight = 44;
      const x = width - buttonWidth - 40;
      const y = 40;

      // Draw image on PDF
      firstPage.drawImage(playButtonImage, {
        x,
        y,
        width: buttonWidth,
        height: buttonHeight,
      });

      // Add clickable annotation
      const context = pdfDoc.context;
      const annotationDict = context.obj({
        Type: PDFName.of("Annot"),
        Subtype: PDFName.of("Link"),
        Rect: context.obj([
          PDFNumber.of(x),
          PDFNumber.of(y),
          PDFNumber.of(x + buttonWidth),
          PDFNumber.of(y + buttonHeight),
        ]),
        Border: context.obj([PDFNumber.of(0), PDFNumber.of(0), PDFNumber.of(0)]),
        A: context.obj({
          S: PDFName.of("URI"),
          URI: PDFString.of(finalResultUrl),
        }),
      });

      let annots = firstPage.node.lookup(PDFName.of("Annots"));
      if (annots instanceof PDFArray) {
        annots.push(annotationDict);
      } else {
        const annotsArray = context.obj([annotationDict]);
        firstPage.node.set(PDFName.of("Annots"), annotsArray);
      }

      // ✅ Save PDF and create Blob (TypeScript safe)
      const modifiedPdfBytes = await pdfDoc.save();
      const arrayBuffer = modifiedPdfBytes instanceof ArrayBuffer ? modifiedPdfBytes : modifiedPdfBytes.buffer;
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });

      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("❌ Error enhancing PDF:", error);
      throw error;
    }
  };

  // ✅ Download enhanced PDF
  const handleDownloadEnhanced = async () => {
    try {
      if (!resumeUrl) {
        alert("No resume found to enhance.");
        return;
      }

      const enhancedUrl = await enhancePDF(resumeUrl, castId || "profile");
      const a = document.createElement("a");
      a.href = enhancedUrl;
      a.download = "careercast_resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(enhancedUrl);
    } catch (err) {
      console.error("❌ Error enhancing PDF:", err);
      alert("Failed to enhance PDF. Check console for details.");
    }
  };

  // ✅ Fallback if no data
  if (!resumeUrl && !videoUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No resume or video data found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Header ===== */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center px-4 py-3 gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          {user && (
            <Button
              variant="outline"
              onClick={handleDownloadEnhanced}
              className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              <Download className="h-4 w-4" />
              Download Enhanced Resume
            </Button>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handlePlayVideo}
              className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:scale-105 transition-transform"
            >
              <Play className="h-4 w-4 mr-1" fill="white" />
              Play Video
            </Button>

            {user && (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ===== Resume Display ===== */}
      <div className="pt-24 pb-12 px-6">
        <div
          className="max-w-5xl mx-auto border-none shadow-none overflow-hidden flex flex-col"
          style={{ height: "calc(100vh - 140px)" }}
        >
          {resumeUrl ? (
            <iframe
              src={`${resumeUrl}#zoom=page-width`}
              title="Resume Preview"
              className="w-full h-full border-0 rounded-lg block overflow-hidden"
              style={{ height: "calc(100vh - 140px)" }}
            ></iframe>
          ) : (
            <p className="text-gray-500 text-center py-10">No resume available.</p>
          )}
        </div>
      </div>

      {/* ===== Video Player Modal ===== */}
      {showVideoPlayer && videoUrl && (
        <div className="fixed top-20 right-6 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h4 className="text-sm font-semibold text-gray-900">Video Preview</h4>
            <Button
              variant="ghost"
              onClick={() => setShowVideoPlayer(false)}
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
          <div className="p-2">
            <video controls autoPlay className="w-full rounded" src={videoUrl}></video>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalResult;
