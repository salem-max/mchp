'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
const ChatWindow = dynamic(() => import('@/components/chat/ChatWindow'), { ssr: false });
import {
  MapPin,
  Phone,
  Map,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  MessageCircle,
  Play,
  CheckSquare,
  User,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function TechnicianActiveJobPage({ params }: { params: Promise<{ id: string }> }) {
  const [jobId, setJobId] = useState('');
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED'>('ACCEPTED');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  // Resolve params and fetch job
  useEffect(() => {
    params.then(({ id }) => {
      setJobId(id);
    });
  }, [params]);

  // Fetch job data
  useEffect(() => {
    if (!jobId) return;
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          setJob(data);
          setStatus(data.status ?? 'ACCEPTED');
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleStartJob = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/start`, { method: 'POST' });
      if (response.ok) {
        setStatus('IN_PROGRESS');
        toast.success('Job started!');
      } else {
        toast.error('Failed to start job');
      }
    } catch (error) {
      toast.error('Failed to start job');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteJob = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/complete`, { method: 'POST' });
      if (response.ok) {
        setStatus('COMPLETED');
        toast.success('Job completed! Payment has been captured.');
      } else {
        toast.error('Failed to complete job');
      }
    } catch (error) {
      toast.error('Failed to complete job');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSOS = async () => {
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`/api/jobs/${jobId}/sos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude }),
          });

          if (response.ok) {
            toast.success('SOS alert sent to emergency contacts');
            setShowSOS(false);
          } else {
            toast.error('Failed to send SOS alert');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Could not get your location. Please enable location services.');
        }
      );
    } catch (error) {
      toast.error('Failed to send SOS alert');
    }
  };

  const openMaps = () => {
    const lat = job?.latitude ?? 0;
    const lng = job?.longitude ?? 0;
    window.open(`https://www.google.com/maps/?q=${lat},${lng}`, '_blank');
  };

  const callCustomer = () => {
    if (customerPhone) window.location.href = `tel:${customerPhone}`;
  };

  if (isLoading || !job) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  const customerName = job.customer?.full_name ?? 'Customer';
  const customerPhone = job.customer?.phone ?? '';
  const customerAvatar = job.customer?.avatar_url ?? '';
  const budget = job.final_price ?? job.budget_max ?? job.budget ?? 0;

  const statusConfig: Record<string, { color: string; label: string }> = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    ACCEPTED: { color: 'bg-blue-100 text-blue-800', label: 'Ready to Start' },
    IN_PROGRESS: { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
    COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completed' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
          <div className="flex items-center gap-2">
            <Badge className={(statusConfig[status] ?? statusConfig['PENDING']).color}>
              {(statusConfig[status] ?? statusConfig['PENDING']).label}
            </Badge>
            <span className="text-sm text-gray-600">Job ID: {job.id}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-green-600">RM {budget}</p>
          <p className="text-sm text-gray-600 mt-1">Fixed price</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{job.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Category</p>
                  <p className="text-sm font-medium text-gray-900">{job.category}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Scheduled</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <p className="text-sm font-medium text-gray-900">
                      {job.scheduled_date ? new Date(job.scheduled_date).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }) : 'Not scheduled'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{job.address}</p>
                <p className="text-xs text-gray-600 mt-1">{job.address}</p>
              </div>
              <Button
                onClick={openMaps}
                variant="outline"
                className="w-full gap-2"
              >
                <Map className="w-4 h-4" />
                Open in Google Maps
              </Button>
            </CardContent>
          </Card>

          {/* Images */}
          {job.images && job.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Job Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {(job.images as string[] ?? []).map((image: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-200"
                    >
                      <Image
                        src={image}
                        alt={`Job image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {customerAvatar && (
                  <Image
                    src={customerAvatar}
                    alt={customerName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{customerName}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Contact</p>
                <Button
                  onClick={callCustomer}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {customerPhone}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {status === 'ACCEPTED' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={handleStartJob}
                  disabled={isUpdating}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {isUpdating ? 'Starting...' : 'Start Job'}
                </motion.button>
              )}

              {status === 'IN_PROGRESS' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={handleCompleteJob}
                  disabled={isUpdating}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" />
                  {isUpdating ? 'Completing...' : 'Mark as Completed'}
                </motion.button>
              )}

              {status === 'COMPLETED' && (
                <div className="w-full bg-green-100 text-green-800 font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Job Completed
                </div>
              )}

              {/* SOS Button */}
              {showSOS ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-sm text-red-700 font-medium">Confirm SOS Alert?</p>
                  <Button
                    onClick={handleSOS}
                    variant="destructive"
                    className="w-full"
                  >
                    Send SOS
                  </Button>
                  <Button
                    onClick={() => setShowSOS(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </motion.div>
              ) : (
                <Button
                  onClick={() => setShowSOS(true)}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50 gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  SOS Alert
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Timer */}
          {status === 'IN_PROGRESS' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Elapsed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">
                  0 min
                </p>
              </CardContent>
            </Card>
          )}

          {/* Earnings Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Your Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee (20%)</span>
                  <span className="font-medium">- RM {(budget * 0.2).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">You Earn</span>
                  <span className="font-bold text-green-600">
                    RM {(budget * 0.8).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Messages
          </CardTitle>
          <CardDescription>
            Communicate with {customerName} about this job
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChatWindow
            conversationId={job.id}
            jobId={jobId}
            otherUserId="customer-1"
            otherUserName={customerName}
            otherUserAvatar={customerAvatar}
          />
        </CardContent>
      </Card>
    </div>
  );
}
