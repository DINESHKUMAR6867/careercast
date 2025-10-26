import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";

const Step1: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
const [submitting, setSubmitting] = useState(false);

  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    // Load from localStorage
    const savedTitle = localStorage.getItem('careerCast_jobTitle');
    const savedDescription = localStorage.getItem('careerCast_jobDescription');
    
    if (savedTitle) setJobTitle(savedTitle);
    if (savedDescription) setJobDescription(savedDescription);
  }, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!jobTitle.trim() || !jobDescription.trim()) {
    alert('Please fill in all required fields.');
    return;
  }

  // ✅ get logged-in user id
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    alert('Please sign in again.');
    return;
  }

  // ✅ insert new job request
  const { data, error } = await supabase
    .from('job_requests')
    .insert([
      {
        user_id: user.id,
        job_title: jobTitle,
        job_description: jobDescription,
        status: 'draft',
      },
    ])
    .select('id')
    .single();

  if (error) {
    console.error('❌ Error creating job request:', error.message);
    alert('Failed to save job details.');
    return;
  }

  // ✅ store job info + id locally for next steps
  localStorage.setItem('careerCast_jobTitle', jobTitle);
  localStorage.setItem('careerCast_jobDescription', jobDescription);
  localStorage.setItem('current_job_request_id', data.id);

  alert('Job details saved!');
  navigate('/step2');
};



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          {/* Step Indicator */}
          <div className="flex justify-between items-center mb-6 relative px-8">
            {/* Connecting Line - Full gray */}
            <div className="absolute top-4 left-16 right-16 h-0.5 bg-gray-300 -z-10"></div>
            
            {/* Step 1 - Active */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="text-xs mt-1 text-blue-600 font-medium">Job Details</span>
            </div>
            
            {/* Step 2 - Inactive */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-xs mt-1 text-gray-500">Upload Resume</span>
            </div>
            
            {/* Step 3 - Inactive */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-xs mt-1 text-gray-500">Record Video</span>
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-center">Job Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="job-title" className="text-sm font-medium text-gray-700">
                Job Title *
              </label>
              <Input
                id="job-title"
                type="text"
                placeholder="e.g., Senior Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                className="w-full"
              />
              <p className="text-sm text-gray-500">Enter the official title for this position</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="job-description" className="text-sm font-medium text-gray-700">
                Job Description *
              </label>
              <Textarea
                id="job-description"
                placeholder="Describe the responsibilities, required skills, and qualifications for this position..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
                className="min-h-[120px]"
              />
              <p className="text-sm text-gray-500">
                Be specific about what makes this role unique and what you're looking for in candidates
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Back
              </Button>
              <Button type="submit" disabled={submitting}>
  {submitting ? "Saving..." : "Next Step →"}
</Button>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step1;