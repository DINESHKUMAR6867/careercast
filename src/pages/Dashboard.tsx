import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import {
  Video,
  Eye,
  CheckCircle,
  Plus,
  LogOut,
  FileText,
  Play,
  Redo,
  Clock,
  Loader2,
} from "lucide-react";
import { supabase } from "../integrations/supabase/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [careerCasts, setCareerCasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchJobRequests();
  }, [user]);

  async function fetchJobRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from("job_requests")
      .select(`
        id,
        job_title,
        resume_path,
        status,
        created_at,
        recordings ( storage_path )
      `)
      .eq("user_id", user?.id)

      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading job requests:", error);
    } else {
      setCareerCasts(data || []);
    }
    setLoading(false);
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNewCast = () => navigate("/step1");
  const handleReRecord = (id: string) => navigate(`/record/${id}`);
  const handleViewDetails = (id: string) => navigate(`/final-result/${id}`);
  const handleCloseVideo = () => setSelectedVideo(null);

  const getBadge = (status: string) => {
    switch (status) {
      case "recorded":
        return (
          <span className="inline-flex items-center gap-1 bg-green-100/80 text-green-700 px-2 py-1 rounded-md text-xs font-medium shadow-sm">
            <CheckCircle className="w-3 h-3" /> Recorded
          </span>
        );
      case "complete":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100/80 text-blue-700 px-2 py-1 rounded-md text-xs font-medium shadow-sm">
            <Clock className="w-3 h-3" /> Resume Uploaded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100/80 text-gray-600 px-2 py-1 rounded-md text-xs font-medium shadow-sm">
            <Clock className="w-3 h-3" /> Draft
          </span>
        );
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          {/* Left */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
              CC
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                CareerCast Dashboard
              </h1>
              <p className="text-gray-500 text-sm">
                Manage your video resumes & submissions
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-100/70 px-4 py-2 rounded-lg shadow-inner">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.email?.[0].toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-gray-800 text-sm font-semibold">
                  {user?.email || "User"}
                </p>
                <p className="text-gray-500 text-xs">Professional Account</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-all"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden transition-all">
          {/* Header Row */}
          <div className="flex justify-between items-center border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Your CareerCasts
              </h2>
              <p className="text-gray-600 text-sm">
                Track progress and manage your recordings
              </p>
            </div>
            <button
              onClick={handleNewCast}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> New CareerCast
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 h-8 w-8 mb-3" />
              <p className="text-gray-600 font-medium">
                Loading your CareerCasts...
              </p>
            </div>
          ) : careerCasts.length === 0 ? (
            <div className="text-center py-20">
              <Video className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No CareerCasts Yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Create your first professional video resume and make your
                profile shine.
              </p>
              <button
                onClick={handleNewCast}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto transition-all"
              >
                <Plus className="w-4 h-4" /> Create CareerCast
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
  <table className="w-full text-sm text-left border-collapse">
    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 text-xs uppercase tracking-wide">
      <tr>
        <th className="py-3 px-6">Job Title</th>
        <th className="py-3 px-6">Resume</th>
        <th className="py-3 px-6">Video</th>
        <th className="py-3 px-6">Status</th>
        <th className="py-3 px-6">Created</th>
        <th className="py-3 px-3 text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {careerCasts.map((cast) => {
        const video = cast.recordings?.[0]?.storage_path || null;
        const hasVideo = !!video;
        const hasResume = !!cast.resume_path;
        const bothAvailable = hasVideo && hasResume;

        return (
          <tr
            key={cast.id}
            className="hover:bg-blue-50/40 transition-all duration-200 border-b border-gray-100"
          >
            <td className="py-4 px-6 font-medium text-gray-900">
              {cast.job_title}
            </td>

            {/* Resume Column */}
            <td className="py-4 px-6">
              {hasResume ? (
                <a
                  href={cast.resume_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" /> View Resume
                </a>
              ) : (
                <span className="text-gray-500 italic">No resume uploaded</span>
              )}
            </td>

            {/* Video Column */}
            <td className="py-4 px-6">
              {hasVideo ? (
                <button
                  onClick={() => setSelectedVideo(video)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Play className="w-4 h-4" /> Play
                </button>
              ) : (
                <span className="text-gray-500 italic">No video recorded</span>
              )}
            </td>

            {/* Status */}
            <td className="py-4 px-6">{getBadge(cast.status)}</td>

            {/* Created */}
            <td className="py-4 px-6 text-gray-600">
              {formatDate(cast.created_at)}
            </td>

            {/* Actions */}
            <td className="py-4 px-6 text-right flex justify-end gap-2">
              {/* View button always visible */}
              <button
                onClick={() => bothAvailable && handleViewDetails(cast.id)}
                disabled={!bothAvailable}
                className={`${
                  bothAvailable
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                } text-xs px-3 py-2 rounded-md font-semibold flex items-center gap-1 shadow-sm transition-all`}
              >
                <Eye className="w-3.5 h-3.5" /> View
              </button>

              <button
                onClick={() => handleReRecord(cast.id)}
                className="border border-gray-300 text-gray-700 text-xs px-3 py-2 rounded-md hover:bg-gray-50 font-semibold flex items-center gap-1"
              >
                <Redo className="w-3.5 h-3.5" /> Re-record
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

          )}
        </div>
      </main>

      {/* VIDEO MODAL */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full overflow-hidden relative">
            <div className="flex justify-between items-center border-b border-gray-200 p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-lg">
                CareerCast Video
              </h3>
              <button
                onClick={handleCloseVideo}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="bg-black aspect-video">
              <video
                controls
                autoPlay
                className="w-full h-full rounded-b-lg"
                src={selectedVideo}
              ></video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
