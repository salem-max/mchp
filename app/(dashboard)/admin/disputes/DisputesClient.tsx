'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  DollarSign,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import nextDynamic from 'next/dynamic';
const ChatWindow = nextDynamic(() => import('@/components/chat/ChatWindow'), { ssr: false });

interface Dispute {
  id: string;
  jobId: string;
  jobTitle: string;
  customerId: string;
  customerName: string;
  technicianId: string;
  technicianName: string;
  amount: number;
  status: 'OPEN' | 'RESOLVED_REFUND' | 'RESOLVED_RELEASE';
  reason: string;
  description: string;
  createdAt: Date;
  resolvedAt?: Date;
}

const mockDisputes: Dispute[] = [
  {
    id: '1',
    jobId: 'job-1',
    jobTitle: 'Fix leaking pipe in kitchen',
    customerId: 'cust-1',
    customerName: 'John Doe',
    technicianId: 'tech-1',
    technicianName: 'Ahmad Hassan',
    amount: 150,
    status: 'OPEN',
    reason: 'Quality Issue',
    description: 'Job was not completed properly. Water is still leaking.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60000),
  },
  {
    id: '2',
    jobId: 'job-2',
    jobTitle: 'AC maintenance and cleaning',
    customerId: 'cust-2',
    customerName: 'Sarah Johnson',
    technicianId: 'tech-2',
    technicianName: 'Mike Chen',
    amount: 120,
    status: 'OPEN',
    reason: 'Non-Showed Up',
    description: 'Technician did not show up for the scheduled appointment.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000),
  },
  {
    id: '3',
    jobId: 'job-3',
    jobTitle: 'Electrical outlet installation',
    customerId: 'cust-3',
    customerName: 'Emma Wilson',
    technicianId: 'tech-3',
    technicianName: 'Sarah Wilson',
    amount: 200,
    status: 'RESOLVED_REFUND',
    reason: 'Payment Mismatch',
    description: 'Customer was charged double.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60000),
    resolvedAt: new Date(Date.now() - 10 * 24 * 60 * 60000),
  },
];

export default function DisputesClient() {
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState<'refund' | 'release' | null>(null);
  const [notes, setNotes] = useState('');

  const openDisputes = disputes.filter((d) => d.status === 'OPEN');
  const resolvedDisputes = disputes.filter((d) => d.status !== 'OPEN');

  const handleResolveDispute = async (disputeId: string, resolutionType: 'refund' | 'release') => {
    const dispute = disputes.find((d) => d.id === disputeId);
    if (!dispute) return;

    setDisputes(
      disputes.map((d) =>
        d.id === disputeId
          ? {
            ...d,
            status: resolutionType === 'refund' ? 'RESOLVED_REFUND' : 'RESOLVED_RELEASE',
            resolvedAt: new Date(),
          }
          : d
      )
    );

    toast.success(
      `Dispute resolved - Payment will be ${resolutionType === 'refund' ? 'refunded to customer' : 'released to technician'}`
    );
    setSelectedDispute(null);
    setResolution(null);
    setNotes('');
  };

  const statusConfig = {
    OPEN: { color: 'bg-red-100 text-red-800', label: 'Open', icon: AlertTriangle },
    RESOLVED_REFUND: { color: 'bg-blue-100 text-blue-800', label: 'Refunded', icon: DollarSign },
    RESOLVED_RELEASE: { color: 'bg-green-100 text-green-800', label: 'Released', icon: CheckCircle2 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dispute Management</h1>
        <p className="text-gray-600 mt-1">
          Review and resolve disputes between customers and technicians
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-red-600">{openDisputes.length}</p>
            <p className="text-xs text-gray-600 mt-1">Open Disputes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {disputes.filter((d) => d.status === 'RESOLVED_RELEASE').length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Payment Released</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {disputes.filter((d) => d.status === 'RESOLVED_REFUND').length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Refunded</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disputes List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Disputes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value="open" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
                  <TabsTrigger
                    value="open"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600"
                  >
                    Open ({openDisputes.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="resolved"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600"
                  >
                    Resolved
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="open" className="space-y-2 p-4 mt-0">
                  {openDisputes.length === 0 ? (
                    <p className="text-sm text-gray-500">No open disputes</p>
                  ) : (
                    openDisputes.map((dispute) => (
                      <motion.button
                        key={dispute.id}
                        onClick={() => setSelectedDispute(dispute)}
                        whileHover={{ scale: 1.02 }}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${selectedDispute?.id === dispute.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {dispute.jobTitle}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {dispute.customerName} vs {dispute.technicianName}
                        </p>
                        <Badge className="bg-red-100 text-red-800 mt-2 text-xs">
                          {dispute.reason}
                        </Badge>
                      </motion.button>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="resolved" className="space-y-2 p-4 mt-0">
                  {resolvedDisputes.length === 0 ? (
                    <p className="text-sm text-gray-500">No resolved disputes</p>
                  ) : (
                    resolvedDisputes.map((dispute) => (
                      <motion.button
                        key={dispute.id}
                        onClick={() => setSelectedDispute(dispute)}
                        whileHover={{ scale: 1.02 }}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${selectedDispute?.id === dispute.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {dispute.jobTitle}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {dispute.customerName}
                        </p>
                        <Badge className={statusConfig[dispute.status].color + ' mt-2 text-xs'}>
                          {statusConfig[dispute.status].label}
                        </Badge>
                      </motion.button>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2">
          {selectedDispute ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedDispute.jobTitle}</CardTitle>
                      <CardDescription className="mt-1">
                        Dispute ID: {selectedDispute.id}
                      </CardDescription>
                    </div>
                    <Badge className={statusConfig[selectedDispute.status].color}>
                      {statusConfig[selectedDispute.status].label}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Parties Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium text-gray-900">{selectedDispute.customerName}</p>
                    <p className="text-xs text-gray-600 mt-1">ID: {selectedDispute.customerId}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Technician
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium text-gray-900">{selectedDispute.technicianName}</p>
                    <p className="text-xs text-gray-600 mt-1">ID: {selectedDispute.technicianId}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Dispute Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Reason</p>
                    <Badge variant="outline">{selectedDispute.reason}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Description</p>
                    <p className="text-sm text-gray-900">{selectedDispute.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Amount</p>
                      <p className="text-2xl font-bold text-gray-900">RM {selectedDispute.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Filed On</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedDispute.createdAt.toLocaleDateString('en-MY')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resolution */}
              {selectedDispute.status === 'OPEN' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Resolution</CardTitle>
                    <CardDescription>Choose how to resolve this dispute</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600 mb-2 block">
                        Resolution Notes
                      </label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter notes about the resolution..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleResolveDispute(selectedDispute.id, 'refund')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        Refund Customer
                      </Button>
                      <Button
                        onClick={() => handleResolveDispute(selectedDispute.id, 'release')}
                        className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Release Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chat (placeholder) */}
              {selectedDispute.status === 'OPEN' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Dispute Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChatWindow
                      conversationId={selectedDispute.id}
                      otherUserId={selectedDispute.customerId}
                      otherUserName={`${selectedDispute.customerName} & ${selectedDispute.technicianName}`}
                    />
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ) : (
            <Card className="min-h-96 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Select a dispute to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
