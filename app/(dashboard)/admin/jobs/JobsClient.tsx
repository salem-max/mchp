'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Trash2, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  customerName: string;
  technicianName?: string;
  budget: number;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  category: string;
  location: string;
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Fix leaking pipe in kitchen',
    customerName: 'John Doe',
    technicianName: 'Ahmad Hassan',
    budget: 150,
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000),
    category: 'Plumbing',
    location: 'Kuala Lumpur',
  },
  {
    id: '2',
    title: 'AC maintenance and cleaning',
    customerName: 'Sarah Johnson',
    technicianName: 'Mike Chen',
    budget: 120,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60000),
    category: 'HVAC',
    location: 'Petaling Jaya',
  },
  {
    id: '3',
    title: 'Electrical outlet installation',
    customerName: 'Emma Wilson',
    budget: 200,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1 * 60 * 60000),
    category: 'Electrical',
    location: 'Subang Jaya',
  },
  {
    id: '4',
    title: 'Door lock replacement',
    customerName: 'Mike Chen',
    technicianName: 'Sarah Wilson',
    budget: 85,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60000),
    category: 'Locks',
    location: 'Bangsar',
  },
  {
    id: '5',
    title: 'Paint living room walls',
    customerName: 'Robert Davis',
    budget: 180,
    status: 'CANCELLED',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60000),
    category: 'Painting',
    location: 'Klang',
  },
];

export default function JobsClient() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || job.status === filterStatus;
    const matchesCategory = filterCategory === 'ALL' || job.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(jobs.map((j) => j.category))];

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      setJobs(jobs.filter((j) => j.id !== jobId));
      toast.success('Job deleted');
    }
  };

  const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    ACCEPTED: { color: 'bg-blue-100 text-blue-800', label: 'Accepted' },
    IN_PROGRESS: { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
    COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
  };

  const stats = [
    { label: 'Total Jobs', value: jobs.length, color: 'bg-blue-100' },
    { label: 'Active', value: jobs.filter((j) => ['ACCEPTED', 'IN_PROGRESS'].includes(j.status)).length, color: 'bg-purple-100' },
    { label: 'Completed', value: jobs.filter((j) => j.status === 'COMPLETED').length, color: 'bg-green-100' },
    { label: 'Cancelled', value: jobs.filter((j) => j.status === 'CANCELLED').length, color: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
        <p className="text-gray-600 mt-1">Monitor all platform jobs and handle violations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by job title or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Technician</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Budget</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Created</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <p className="text-gray-500">No jobs found</p>
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {/* Title */}
                      <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">
                        {job.title}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4 text-sm text-gray-600">{job.customerName}</td>

                      {/* Technician */}
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {job.technicianName || '—'}
                      </td>

                      {/* Budget */}
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        RM {job.budget}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-sm text-gray-600">{job.category}</td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge className={statusConfig[job.status].color}>
                          {statusConfig[job.status].label}
                        </Badge>
                      </td>

                      {/* Created */}
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {job.createdAt.toLocaleDateString('en-MY')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
