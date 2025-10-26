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

//       const blob = new Blob([enhancedResumeContent], { type: 'text/html' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `enhanced_${careerCast?.resumeFileName?.replace('.pdf', '.html') || 'resume.html'}`;
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
//               Download Enhanced Resume
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
                      

```

```
