'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Shield,
  ToggleLeft,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'BOTH';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  avatar?: string;
  joinedDate: Date;
  verified?: boolean;
  jobsCompleted?: number;
  rating?: number;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ahmad Hassan',
    email: 'ahmad@example.com',
    phone: '+60123456789',
    role: 'TECHNICIAN',
    status: 'ACTIVE',
    verified: true,
    joinedDate: new Date('2022-01-15'),
    jobsCompleted: 127,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+60198765432',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    verified: true,
    joinedDate: new Date('2023-05-20'),
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+60112341234',
    role: 'TECHNICIAN',
    status: 'ACTIVE',
    verified: true,
    joinedDate: new Date('2022-08-12'),
    jobsCompleted: 98,
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Mike Chen',
    email: 'mike@example.com',
    phone: '+60156567890',
    role: 'TECHNICIAN',
    status: 'SUSPENDED',
    verified: false,
    joinedDate: new Date('2023-02-10'),
    jobsCompleted: 45,
    rating: 3.9,
  },
  {
    id: '5',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    phone: '+60191234567',
    role: 'BOTH',
    status: 'BANNED',
    verified: false,
    joinedDate: new Date('2022-11-05'),
  },
];

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'CUSTOMER' | 'TECHNICIAN' | 'BOTH'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'BANNED'>('ALL');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    const matchesStatus = filterStatus === 'ALL' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleVerifyTechnician = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, verified: !u.verified } : u
      )
    );
    toast.success('User verification status updated');
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED' }
          : u
      )
    );
    toast.success('User status updated');
  };

  const handleBanUser = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, status: 'BANNED' }
          : u
      )
    );
    toast.success('User has been banned');
  };

  const statusConfig = {
    ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active' },
    SUSPENDED: { color: 'bg-yellow-100 text-yellow-800', label: 'Suspended' },
    BANNED: { color: 'bg-red-100 text-red-800', label: 'Banned' },
  };

  const stats = [
    { label: 'Total Users', value: users.length, color: 'bg-blue-100' },
    { label: 'Active', value: users.filter((u) => u.status === 'ACTIVE').length, color: 'bg-green-100' },
    { label: 'Suspended', value: users.filter((u) => u.status === 'SUSPENDED').length, color: 'bg-yellow-100' },
    { label: 'Banned', value: users.filter((u) => u.status === 'BANNED').length, color: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage platform users, verify technicians, handle violations</p>
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="ALL">All Roles</option>
                <option value="CUSTOMER">Customers</option>
                <option value="TECHNICIAN">Technicians</option>
                <option value="BOTH">Both</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Joined</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <p className="text-gray-500">No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {user.avatar && (
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <Badge variant="outline">{user.role}</Badge>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge className={statusConfig[user.status].color}>
                          {statusConfig[user.status].label}
                        </Badge>
                      </td>

                      {/* Joined */}
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.joinedDate.toLocaleDateString('en-MY')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {user.role === 'TECHNICIAN' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVerifyTechnician(user.id)}
                              title={user.verified ? 'Unverify' : 'Verify'}
                            >
                              {user.verified ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                              )}
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSuspendUser(user.id)}
                            title={user.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                          >
                            <ToggleLeft className="w-4 h-4" />
                          </Button>

                          {user.status !== 'BANNED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleBanUser(user.id)}
                              className="text-red-600"
                              title="Ban User"
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                          )}
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
