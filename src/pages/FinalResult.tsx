import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { ArrowLeft, Download, Play, LogOut } from 'lucide-react';
import { PDFDocument, PDFArray, PDFName } from 'pdf-lib';
import html2pdf from 'html2pdf.js';

interface CareerCast {
  id: string;
  jobTitle: string;
  jobDescription: string;
  resumeUrl: string;
  resumeFileName: string;
  resumeContent: string;
  videoUrl: string;
  createdAt: string;
}

const FinalResult: React.FC = () => {
  const navigate = useNavigate();
  const { castId } = useParams<{ castId: string }>();
  const { user, logout } = useAuth();
  const [careerCast, setCareerCast] = useState<CareerCast | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [resumeContent, setResumeContent] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isExternalVisitor, setIsExternalVisitor] = useState(false);

  useEffect(() => {
    const loadCareerCastData = () => {
      const savedCastId = castId || localStorage.getItem('current_cast_id');
      
      if (savedCastId) {
        const savedCasts = JSON.parse(localStorage.getItem('careerCasts') || '[]');
        const foundCast = savedCasts.find((cast: CareerCast) => cast.id === savedCastId);
        
        if (foundCast) {
          setCareerCast(foundCast);
          
          const actualResumeContent = foundCast.resumeContent || 
            localStorage.getItem('resumeFullText') || 
            'No resume content available.';
          setResumeContent(actualResumeContent);
          
          const contentLength = actualResumeContent.length;
          const estimatedPages = Math.max(1, Math.ceil(contentLength / 1500));
          setTotalPages(estimatedPages);
          
          return;
        }
      }
      
      // Fallback for external visitors or missing data
      if (!user) {
        setIsExternalVisitor(true);
      }
      
      const jobTitle = localStorage.getItem('careerCast_jobTitle') || 'Your Position';
      const resumeFileName = localStorage.getItem('resumeFileName');
      const videoUrl = localStorage.getItem('recordedVideoUrl');
      const resumeContentFromStorage = localStorage.getItem('resumeContent');
      
      const fallbackCast: CareerCast = {
        id: savedCastId || 'temp-id',
        jobTitle,
        jobDescription: localStorage.getItem('careerCast_jobDescription') || '',
        resumeUrl: localStorage.getItem('uploadedResumeUrl') || '',
        resumeFileName: resumeFileName || 'resume.pdf',
        resumeContent: resumeContentFromStorage || 'No content available.',
        videoUrl: videoUrl || '',
        createdAt: new Date().toISOString(),
      };
      
      setCareerCast(fallbackCast);
      setResumeContent(fallbackCast.resumeContent || '');
      
      const contentLength = fallbackCast.resumeContent?.length || 0;
      const estimatedPages = Math.max(1, Math.ceil(contentLength / 1500));
      setTotalPages(estimatedPages);
    };

    loadCareerCastData();
  }, [castId, user]);

  const enhancePDF = async (pdfUrl: string, fileName: string) => {
    try {
      // 1️⃣ Fetch PDF
      const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const ctx = pdfDoc.context;

      // 2️⃣ Add watermark
      const pages = pdfDoc.getPages();
      const helveticaFont = await pdfDoc.embedFont('Helvetica');
      
      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText('Enhanced by CareerCast', {
          x: width / 2 - 60,
          y: 20,
          size: 12,
          font: helveticaFont,
          color: { r: 0.5, g: 0.5, b: 0.5 },
        });
      });

      // 3️⃣ Add annotation
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      
      const annot = ctx.obj({
        Type: 'Annot',
        Subtype: 'Text',
        Rect: [width - 150, height - 100, width - 50, height - 50],
        Contents: ctx.obj('Enhanced by CareerCast'),
        T: ctx.obj('CareerCast'),
        Name: 'Comment',
        Subj: 'Enhanced Resume',
        Open: false,
      });
      
      const annots = firstPage.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
      if (annots instanceof PDFArray) annots.push(annot);
      else firstPage.node.set(PDFName.of('Annots'), ctx.obj([annot]));

      // 5️⃣ Export new PDF blob
      // Save and export as Blob
      const modifiedPdfBytes = await pdfDoc.save();
      // Fix for TypeScript error: Convert properly to ArrayBuffer
      const arrayBuffer = modifiedPdfBytes instanceof Uint8Array 
        ? modifiedPdfBytes.buffer.slice(
            modifiedPdfBytes.byteOffset,
            modifiedPdfBytes.byteOffset + modifiedPdfBytes.byteLength
          )
        : modifiedPdfBytes;
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('❌ PDF enhancement failed:', err);
      throw err;
    }
  };

  const handleDownloadEnhanced = async () => {
    try {
      if (!careerCast?.resumeUrl) {
        alert('No resume found to enhance.');
        return;
      }

      const enhancedUrl = await enhancePDF(careerCast.resumeUrl, careerCast.id || 'profile');
      const a = document.createElement('a');
      a.href = enhancedUrl;
      a.download = 'careercast_resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(enhancedUrl);
    } catch (err) {
      alert('Failed to enhance PDF. Check console for details.');
    }
  };

  const handlePlayVideo = () => {
    if (isExternalVisitor) {
      alert('Please log in to view the video introduction, or contact the candidate directly.');
      return;
    }
    setShowVideoPlayer(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!careerCast) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading your CareerCast...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-4 px-6 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {user ? (
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          ) : (
            <div className="w-32"></div>
          )}

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

          <div className="flex items-center gap-4">
            <Button
              onClick={handlePlayVideo}
              className="flex items-center gap-3 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] px-5 py-2.5 rounded-xl font-semibold border-0 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="flex items-center justify-center w-6 h-6 bg-white/30 rounded-full backdrop-blur-sm z-10">
                <Play className="h-3.5 w-3.5" fill="white" />
              </div>
              <span className="z-10">
                {isExternalVisitor ? 'View Video' : 'Play Video'}
              </span>
            </Button>
            
            {user ? (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-24 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          {isExternalVisitor && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Welcome to CareerCast!
                  </h3>
                  <p className="text-blue-700">
                    You're viewing a shared CareerCast profile. {user ? 'You can play the video introduction above.' : 'Please log in or contact the candidate to access the full video introduction.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
            </CardHeader>
            <CardContent>
              <div className="border border-gray-200 rounded-lg bg-white min-h-[600px]">
                <div className="p-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                    <div className="bg-white border border-gray-300 rounded-t-lg p-4 mb-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {careerCast.resumeFileName || 'Resume-AWL-2346_hPpTMWC.pdf'}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500">126%</span>
                          <span className="text-xs text-gray-500">{currentPage} / {totalPages}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showVideoPlayer && careerCast.videoUrl && (
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
            <video controls autoPlay className="w-full rounded" src={careerCast.videoUrl}></video>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalResult;