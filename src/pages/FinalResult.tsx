// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
// import { Button } from '../components/ui/button';
// import { Download, Play, ArrowLeft, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
// import { useAuthContext } from '../contexts/AuthContext';

// interface CareerCast {
//   id: string;
//   jobTitle: string;
//   resumeFileName?: string;
//   videoUrl?: string;
//   createdAt: string;
//   resumeContent?: string;
// }

// const FinalResult: React.FC = () => {
//   const navigate = useNavigate();
//   const { castId } = useParams<{ castId: string }>();
//   const { user, logout } = useAuthContext();
//   const [careerCast, setCareerCast] = useState<CareerCast | null>(null);
//   const [showVideoPlayer, setShowVideoPlayer] = useState(false);
//   const [resumeContent, setResumeContent] = useState<string>('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [isExternalVisitor, setIsExternalVisitor] = useState(false);

//   useEffect(() => {
//     const loadCareerCastData = () => {
//       const savedCastId = castId || localStorage.getItem('current_cast_id');
      
//       if (savedCastId) {
//         const savedCasts = JSON.parse(localStorage.getItem('careerCasts') || '[]');
//         const foundCast = savedCasts.find((cast: CareerCast) => cast.id === savedCastId);
        
//         if (foundCast) {
//           setCareerCast(foundCast);
//           const actualResumeContent = foundCast.resumeContent || 
//                                     localStorage.getItem('resumeContent') || 
//                                     `Resume: ${foundCast.resumeFileName || 'No resume content available'}`;
//           setResumeContent(actualResumeContent);
//           const contentLength = actualResumeContent.length;
//           const estimatedPages = Math.max(1, Math.ceil(contentLength / 1500));
//           setTotalPages(estimatedPages);
//         } else {
//           if (castId && !user) {
//             setIsExternalVisitor(true);
//             const publicCast: CareerCast = {
//               id: castId,
//               jobTitle: 'Professional Candidate',
//               resumeFileName: 'Resume.pdf',
//               videoUrl: localStorage.getItem('recordedVideoUrl') || undefined,
//               createdAt: new Date().toISOString(),
//               resumeContent: 'This is a public CareerCast resume. Please contact the candidate for full access.'
//             };
//             setCareerCast(publicCast);
//             setResumeContent(publicCast.resumeContent);
//           } else {
//             const jobTitle = localStorage.getItem('careerCast_jobTitle') || 'Your Position';
//             const resumeFileName = localStorage.getItem('resumeFileName');
//             const videoUrl = localStorage.getItem('recordedVideoUrl');
//             const resumeContentFromStorage = localStorage.getItem('resumeContent');
            
//             const fallbackCast: CareerCast = {
//               id: savedCastId,
//               jobTitle: jobTitle,
//               resumeFileName: resumeFileName || undefined,
//               videoUrl: videoUrl || undefined,
//               createdAt: new Date().toISOString(),
//               resumeContent: resumeContentFromStorage || `Resume: ${resumeFileName || 'No resume uploaded'}`
//             };
//             setCareerCast(fallbackCast);
//             setResumeContent(fallbackCast.resumeContent || '');
//             const contentLength = fallbackCast.resumeContent?.length || 0;
//             const estimatedPages = Math.max(1, Math.ceil(contentLength / 1500));
//             setTotalPages(estimatedPages);
//           }
//         }
//       } else if (castId) {
//         setIsExternalVisitor(true);
//         const publicCast: CareerCast = {
//           id: castId,
//           jobTitle: 'Professional Candidate',
//           resumeFileName: 'Resume.pdf',
//           videoUrl: undefined,
//           createdAt: new Date().toISOString(),
//           resumeContent: 'Welcome to CareerCast! This candidate has shared their video resume with you. Please contact them directly to access the video introduction.'
//         };
//         setCareerCast(publicCast);
//         setResumeContent(publicCast.resumeContent);
//       }
//     };

//     loadCareerCastData();
//   }, [castId, user]);

//  const handleDownloadResume = () => {
//   if (resumeContent) {
//     // Get the base URL without the current path
//     const baseUrl = window.location.origin;
//     const finalResultUrl = `${baseUrl}/final-result/${careerCast?.id || ''}`;

//     const enhancedResumeContent = `
// ${resumeContent}

// ---

// <div style="text-align: center; margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 12px; color: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); position: relative; overflow: hidden; display: inline-block; cursor: pointer;" onclick="window.open('${finalResultUrl}', '_blank')">
//   <div style="position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transform: skewX(-12deg) translateX(-100%);"></div>
  
//   <div style="display: flex; align-items: center; gap: 12px; justify-content: center; position: relative; z-index: 10;">
//     <div style="width: 24px; height: 24px; background: rgba(255,255,255,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
//       <span style="color: white; font-weight: bold; margin-left: 2px;">►</span>
//     </div>
//     <span style="font-weight: 600; font-size: 16px;">Play Video Introduction</span>
//   </div>
// </div>

// <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 10px;">
//   Click the button above to watch my video introduction (opens CareerCast page)
// </p>

// <p style="text-align: center; color: #374151; font-size: 12px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
//   CareerCast Video Resume • Enhanced with AI • ${new Date().toLocaleDateString()}
// </p>

// <script>
// const playButton = document.querySelector('div[onclick*="final-result"]');
// if (playButton) {
//   playButton.addEventListener('mouseenter', function() {
//     this.style.transform = 'scale(1.02)';
//     this.style.transition = 'transform 0.2s ease';
//   });
  
//   playButton.addEventListener('mouseleave', function() {
//     this.style.transform = 'scale(1)';
//   });
  
//   const shine = this.querySelector('div:first-child');
//   playButton.addEventListener('mouseenter', function() {
//     shine.style.transition = 'transform 1s ease';
//     shine.style.transform = 'skewX(-12deg) translateX(200%)';
//   });
  
//   playButton.addEventListener('mouseleave', function() {
//     shine.style.transform = 'skewX(-12deg) translateX(-100%)';
//   });
// }
// </script>
//       `.trim();

//       const blob = new Blob([dResumeContent], { type: 'text/html' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `d_${careerCast?.resumeFileName?.replace('.pdf', '.html') || 'resume.html'}`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     } else {
//       alert('No resume content available to download.');
//     }
//   };

//   const handlePlayVideo = () => {
//     if (isExternalVisitor) {
//       alert('Please log in to view the video introduction, or contact the candidate directly.');
//       return;
//     }
//     setShowVideoPlayer(true);
//   };

//   const handleCloseVideo = () => {
//     setShowVideoPlayer(false);
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   const handlePreviousPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const renderResumeContent = () => {
//     if (!resumeContent) return null;

//     const contentPerPage = 1500;
//     const startIndex = (currentPage - 1) * contentPerPage;
//     const endIndex = startIndex + contentPerPage;
//     const pageContent = resumeContent.slice(startIndex, endIndex);

//     return (
//       <div className="space-y-4">
//         {pageContent.split('\n').map((line, index) => {
//           if (line.trim() === '') return <div key={index} className="h-4" />;
          
//           if (line.startsWith('# ') && !line.includes('Resume Preview')) {
//             return <h1 key={index} className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 pb-2">{line.replace('# ', '')}</h1>;
//           }
//           if (line.startsWith('## ')) {
//             return <h2 key={index} className="text-xl font-semibold text-gray-800 mt-4 mb-2">{line.replace('## ', '')}</h2>;
//           }
//           if (line.startsWith('### ')) {
//             return <h3 key={index} className="text-lg font-medium text-gray-700 mt-3 mb-1">{line.replace('### ', '')}</h3>;
//           }
//           if (line.startsWith('**') && line.endsWith('**')) {
//             return <p key={index} className="font-semibold text-gray-800">{line.replace(/\*\*/g, '')}</p>;
//           }
//           if (line.startsWith('- ')) {
//             return (
//               <div key={index} className="flex items-start">
//                 <span className="mr-2">•</span>
//                 <span>{line.replace('- ', '')}</span>
//               </div>
//             );
//           }
//           if (line.includes('---')) {
//             return <hr key={index} className="my-4 border-gray-300" />;
//           }
          
//           return <p key={index} className="text-gray-700 leading-relaxed">{line}</p>;
//         })}
//       </div>
//     );
//   };

//   if (!careerCast) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Card className="w-full max-w-2xl">
//           <CardContent className="p-8 text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//             <p>Loading your CareerCast...</p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white border-b border-gray-200 py-4 px-6 fixed top-0 left-0 right-0 z-50 shadow-sm">
//         <div className="max-w-7xl mx-auto flex justify-between items-center">
//           {user ? (
//             <Button
//               variant="outline"
//               onClick={() => navigate('/dashboard')}
//               className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               Back to Dashboard
//             </Button>
//           ) : (
//             <div className="w-32"></div>
//           )}

//           {user && (
//             <Button
//               variant="outline"
//               onClick={handleDownloadResume}
//               className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
//             >
//               <Download className="h-4 w-4" />
//               Download d Resume
//             </Button>
//           )}

//           <div className="flex items-center gap-4">
//             <Button
//               onClick={handlePlayVideo}
//               className="flex items-center gap-3 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] px-5 py-2.5 rounded-xl font-semibold border-0 relative overflow-hidden group"
//             >
//               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
//               <div className="flex items-center justify-center w-6 h-6 bg-white/30 rounded-full backdrop-blur-sm z-10">
//                 <Play className="h-3.5 w-3.5" fill="white" />
//               </div>
//               <span className="z-10">
//                 {isExternalVisitor ? 'View Video' : 'Play Video'}
//               </span>
//             </Button>
            
//             {user ? (
//               <Button
//                 variant="outline"
//                 onClick={handleLogout}
//                 className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
//               >
//                 <LogOut className="h-4 w-4" />
//                 Logout
//               </Button>
//             ) : (
//               <Button
//                 variant="outline"
//                 onClick={() => navigate('/auth')}
//                 className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
//               >
//                 Login
//               </Button>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="pt-24 pb-8 px-6">
//         <div className="max-w-7xl mx-auto">
//           {isExternalVisitor && (
//             <Card className="mb-6 bg-blue-50 border-blue-200">
//               <CardContent className="p-4">
//                 <div className="text-center">
//                   <h3 className="text-lg font-semibold text-blue-800 mb-2">
//                     Welcome to CareerCast!
//                   </h3>
//                   <p className="text-blue-700">
//                     You're viewing a shared CareerCast profile. {user ? 'You can play the video introduction above.' : 'Please log in or contact the candidate to access the full video introduction.'}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           <Card className="w-full">
//             <CardHeader className="flex flex-row items-center justify-between">
//             </CardHeader>
//             <CardContent>
//               <div className="border border-gray-200 rounded-lg bg-white min-h-[600px]">
//                 <div className="p-6">
//                   <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[500px] overflow-y-auto">
//                     <div className="bg-white border border-gray-300 rounded-t-lg p-4 mb-4 shadow-sm">
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="text-sm font-medium text-gray-700">
//                           {careerCast.resumeFileName || 'Resume-AWL-2346_hPpTMWC.pdf'}
//                         </span>
//                         <div className="flex items-center gap-4">
//                           <span className="text-xs text-gray-500">126%</span>
//                           <span className="text-xs text-gray-500">{currentPage} / {totalPages}</span>
//                         </div>
//                       </div>
                      
//                       <div className="flex items-center justify-between">
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={handlePreviousPage}
//                           disabled={currentPage === 1}
//                           className="h-8 px-3 text-xs"
//                         >
//                           <ChevronLeft className="h-3 w-3 mr-1" />
//                           Previous
//                         </Button>
                        
//                         <div className="flex items-center gap-2">
//                           <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
//                         </div>
                        
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={handleNextPage}
//                           disabled={currentPage === totalPages}
//                           className="h-8 px-3 text-xs"
//                         >
//                           Next
//                           <ChevronRight className="h-3 w-3 ml-1" />
//                         </Button>
//                       </div>
//                     </div>
                    
//                     <div className="bg-white border border-gray-300 rounded-b-lg min-h-[400px] p-6">
//                       {resumeContent ? (
//                         <div className="text-gray-800 font-sans">
//                           {renderResumeContent()}
//                         </div>
//                       ) : (
//                         <div className="text-center py-12 text-gray-500">
//                           No resume content available
//                         </div>
//                       )}
                      
//                       {totalPages > 1 && (
//                         <div className="text-center mt-6 pt-4 border-t border-gray-200">
//                           <span className="text-xs text-gray-500">--- {currentPage} of {totalPages} ---</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {showVideoPlayer && careerCast.videoUrl && user && (
//         <div className="fixed top-20 right-6 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
//           <div className="p-3 border-b border-gray-200 flex justify-between items-center">
//             <h4 className="text-sm font-semibold text-gray-900">Video Preview</h4>
//             <Button
//               variant="ghost"
//               onClick={handleCloseVideo}
//               className="h-6 w-6 p-0"
//             >
//               ✕
//             </Button>
//           </div>
//           <div className="p-2">
//             <video
//               controls
//               autoPlay
//               className="w-full rounded"
//               src={careerCast.videoUrl}
//             >
//               Your browser does not support the video tag.
//             </video>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FinalResult;
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

  // ✅ Play video modal
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

  // ✅  PDF with embedded play button
  // ✅ Enhance PDF with embedded clickable "Play Video" button
// ✅ Enhance PDF with embedded clickable "Play Video" button (Top-Right)
const enhancePDF = async (resumeUrl: string, castId: string) => {
  try {
    // Absolute URL of the current page for redirect
    const baseUrl = window.location.origin || "https://careercast-omega.vercel.app";
    const finalResultUrl = `${baseUrl}/final-result/${castId || "profile"}`;

    console.log("🎯 Embedding link to:", finalResultUrl);

    // Fetch and load the original PDF
    const existingPdfBytes = await fetch(resumeUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const firstPage = pdfDoc.getPages()[0];
    const { width, height } = firstPage.getSize();

    // Load play button image
    const imagePath = `${baseUrl}/images/play_video_button.png`;
    console.log("🖼️ Loading play button image from:", imagePath);
    const imageResponse = await fetch(imagePath);

    // Check if the image fetch is successful
    if (!imageResponse.ok) {
      throw new Error(`Button image not found at ${imagePath}, received status: ${imageResponse.status}`);
    }

    const imageBytes = await imageResponse.arrayBuffer();
    const playButtonImage = await pdfDoc.embedPng(imageBytes);

    // ✅ Position at Top-Right corner
    const buttonWidth = 120;
    const buttonHeight = 40;
    const margin = 30;
    const x = width - buttonWidth - margin;
    const y = height - buttonHeight - margin;

    // Draw the play button image
    firstPage.drawImage(playButtonImage, {
      x,
      y,
      width: buttonWidth,
      height: buttonHeight,
    });

    // ✅ Create clickable annotation linking to the current FinalResult page
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

    // Attach annotation
    let annots = firstPage.node.lookup(PDFName.of("Annots"));
    if (annots instanceof PDFArray) {
      annots.push(annotationDict);
    } else {
      const annotsArray = context.obj([annotationDict]);
      firstPage.node.set(PDFName.of("Annots"), annotsArray);
    }

    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(modifiedPdfBytes)], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("❌ Error enhancing PDF:", error);
    throw error;
  }
};


  // ✅ Download Enhanced Resume
  const handleDownloadEnhanced = async () => {
    try {
      if (!resumeUrl) {
        alert("No resume found to enhance.");
        return;
      }

      console.log("Enhancing PDF...");
      const enhancedUrl = await enhancePDF(resumeUrl, castId || "profile");

      // ✅ Generate filename based on first name
      const firstName =
  localStorage.getItem("first_name") ||
  ((user as any)?.user_metadata?.full_name?.split(" ")[0]) ||
  "user";


      const cleanFirstName = firstName.trim().replace(/\s+/g, "_").toLowerCase();
    //   const finalFileName = `${cleanFirstName}_careercast_resume.pdf`;
        const finalFileName = `careercast_resume.pdf`;


      const a = document.createElement("a");
      a.href = enhancedUrl;
      a.download = finalFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error enhancing file:", err);
      alert("Failed to enhance PDF. Please verify your button image path.");
    }
  };

  // ✅ Fallback message
  if (!resumeUrl && !videoUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No resume or video data found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Header Section ===== */}
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

      {/* ===== Resume Display Section ===== */}
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
            <p className="text-gray-500 text-center py-10">
              No resume available.
            </p>
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



