'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Users, Briefcase, AlertCircle, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const chartData = [
  { date: 'Mon', jobs: 12, revenue: 2400 },
  { date: 'Tue', jobs: 19, revenue: 3800 },
  { date: 'Wed', jobs: 14, revenue: 2800 },
  { date: 'Thu', jobs: 23, revenue: 4600 },
  { date: 'Fri', jobs: 31, revenue: 6200 },
  { date: 'Sat', jobs: 18, revenue: 3600 },
  { date: 'Sun', jobs: 9, revenue: 1800 },
];

const topTechnicians = [
  { name: 'Ahmad Hassan', jobs: 127, rating: 4.8 },
  { name: 'Sarah Johnson', jobs: 98, rating: 4.7 },
  { name: 'Mike Chen', jobs: 87, rating: 4.9 },
  { name: 'Emma Wilson', jobs: 76, rating: 4.6 },
  { name: 'Robert Davis', jobs: 65, rating: 4.5 },
];

const jobStatusData = [
  { name: 'Completed', value: 1245, color: '#10b981' },
  { name: 'In Progress', value: 342, color: '#3b82f6' },
  { name: 'Pending', value: 128, color: '#f59e0b' },
  { name: 'Cancelled', value: 45, color: '#ef4444' },
];

export default function DashboardClient() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">3,284</p>
                  <p className="text-xs text-green-600 mt-1">↑ 12% this month</p>
                </div>
                <Users className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">342</p>
                  <p className="text-xs text-blue-600 mt-1">Currently ongoing</p>
                </div>
                <Briefcase className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">RM 125.5K</p>
                  <p className="text-xs text-green-600 mt-1">↑ 8% this week</p>
                </div>
                <DollarSign className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Open Disputes</p>
                  <p className="text-2xl font-bold text-gray-900">23</p>
                  <p className="text-xs text-yellow-600 mt-1">Needs attention</p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">96.2%</p>
                  <p className="text-xs text-green-600 mt-1">All-time high</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs and Revenue Chart */}
      {/* <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Jobs created and revenue generated</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="jobs" fill="#3b82f6" name="Jobs" />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue (RM)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}

      {/* Job Status Distribution */}
      {/* <Card>
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}
      {/* </div> */}

      {/* Top Technicians */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Technicians</CardTitle>
          <CardDescription>Ranked by number of completed jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                    Name
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">
                    Completed Jobs
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {topTechnicians.map((tech, idx) => (
                  <tr key={tech.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {tech.name}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {tech.jobs}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-gray-900">
                        ★ {tech.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
