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

  // ✅ Load stored resume and video URLs
  useEffect(() => {
    const uploadedResumeUrl = localStorage.getItem("uploadedResumeUrl");
    const fileName = localStorage.getItem("resumeFileName");
    const recordedVideoUrl = localStorage.getItem("recordedVideoUrl");

    if (uploadedResumeUrl) setResumeUrl(uploadedResumeUrl);
    if (fileName) setResumeFileName(fileName);
    if (recordedVideoUrl) setVideoUrl(recordedVideoUrl);

    console.log("🎬 Loaded data:", { uploadedResumeUrl, recordedVideoUrl, fileName });
  }, []);

  // ✅ Play video popup
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

  // ✅ Enhance PDF by embedding a clickable play-button that redirects back to /final-result/:castId
  const enhancePDF = async (resumeUrl: string, castId: string) => {
    try {
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/final-result/${castId || "profile"}`;
      console.log("🎯 Embedding redirect URL:", redirectUrl);

      // 1️⃣ Load the existing PDF
      const existingPdfBytes = await fetch(resumeUrl, { mode: "cors" }).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const firstPage = pdfDoc.getPages()[0];
      const { width, height } = firstPage.getSize();

      // 2️⃣ Embed the play button image (must exist at /public/images/play_video_button.png)
      const imagePath = `${baseUrl}/images/play_video_button.png`;
      const imageRes = await fetch(imagePath);
      if (!imageRes.ok) throw new Error(`Button image not found at ${imagePath}`);
      const imgBytes = await imageRes.arrayBuffer();
      const playButtonImg = await pdfDoc.embedPng(imgBytes);

      // 3️⃣ Draw image in bottom-right corner
      const buttonWidth = 140;
      const buttonHeight = 44;
      const x = width - buttonWidth - 40;
      const y = 40;
      firstPage.drawImage(playButtonImg, { x, y, width: buttonWidth, height: buttonHeight });

      // 4️⃣ Add clickable annotation linking to this FinalResult page
      const ctx = pdfDoc.context;
      const annotation = ctx.obj({
        Type: PDFName.of("Annot"),
        Subtype: PDFName.of("Link"),
        Rect: ctx.obj([
          PDFNumber.of(x),
          PDFNumber.of(y),
          PDFNumber.of(x + buttonWidth),
          PDFNumber.of(y + buttonHeight),
        ]),
        Border: ctx.obj([PDFNumber.of(0), PDFNumber.of(0), PDFNumber.of(0)]),
        A: ctx.obj({
          S: PDFName.of("URI"),
          URI: PDFString.of(redirectUrl),
        }),
      });

      let annots = firstPage.node.lookup(PDFName.of("Annots"));
      if (annots instanceof PDFArray) {
        annots.push(annotation);
      } else {
        const annotsArray = ctx.obj([annotation]);
        firstPage.node.set(PDFName.of("Annots"), annotsArray);
      }

      // 5️⃣ Save and create Blob safely
      const modifiedPdfBytes = (await pdfDoc.save()) as unknown as Uint8Array;
      const blob = new Blob([modifiedPdfBytes.buffer], { type: "application/pdf" });
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
      alert("Failed to enhance PDF. Check console for details.");
    }
  };

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

      {/* ===== Video Modal ===== */}
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
