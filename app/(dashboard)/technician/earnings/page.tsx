'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EarningsChart from '@/components/features/dashboard/customer-tech-earningchart';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  ArrowUpRight,
  Zap,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  id: string;
  jobId: string;
  jobTitle: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: 'HELD' | 'RELEASED' | 'REFUNDED' | 'PENDING' | 'COMPLETED' | 'WITHDRAWN';
  date?: string;
  withdrawnDate?: string;
}

export default function TechnicianEarningsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, year

  useEffect(() => {
    fetch('/api/transactions', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => setTransactions([]));
  }, []);

  // Calculate totals
  const totalEarned = transactions
    .filter((t) => t.status !== 'PENDING' && t.status !== 'HELD')
    .reduce((sum, t) => sum + t.netAmount, 0);

  const pendingBalance = transactions
    .filter((t) => t.status === 'PENDING' || t.status === 'HELD')
    .reduce((sum, t) => sum + t.netAmount, 0);

  const totalWithdrawn = transactions
    .filter((t) => t.status === 'WITHDRAWN' || t.status === 'REFUNDED')
    .reduce((sum, t) => sum + t.netAmount, 0);

  const availableBalance = totalEarned - totalWithdrawn;

  const handleWithdraw = async () => {
    if (availableBalance <= 0) {
      toast.error('No available balance to withdraw');
      return;
    }

    setIsWithdrawing(true);
    try {
      const response = await fetch('/api/stripe/express-link');
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
        toast.success('Opening Stripe dashboard...');
      } else {
        toast.error('Failed to get Stripe dashboard link');
      }
    } catch (error) {
      toast.error('Failed to open Stripe dashboard');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleDownloadStatement = async () => {
    try {
      const statement = `Malaysia Co (Maintenance Services) Earnings Statement\nPeriod: ${new Date().getFullYear()}\n\nTotal Earned: RM ${totalEarned}\nTotal Withdrawn: RM ${totalWithdrawn}\nAvailable Balance: RM ${availableBalance}\n\nTransaction History:\n${transactions.map(t => `${t.date ? new Date(t.date).toLocaleDateString() : t.id} - ${t.jobTitle}: RM ${t.amount} (${t.status})`).join('\n')}\n\nGenerated: ${new Date().toISOString()}`;

      const blob = new Blob([statement], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `earnings-statement-${new Date().getFullYear()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Earnings statement downloaded');
    } catch (error) {
      toast.error('Failed to download statement');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings & Withdrawals</h1>
        <p className="text-gray-600">Track your income and manage payouts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    RM {totalEarned.toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Balance</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    RM {pendingBalance.toFixed(2)}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Held for 7-14 days after job completion
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Available Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium mb-1">
                    Available to Withdraw
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    RM {availableBalance.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Withdrawn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Withdrawn</p>
                  <p className="text-2xl font-bold text-gray-900">
                    RM {totalWithdrawn.toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <ArrowUpRight className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={handleWithdraw}
          disabled={availableBalance <= 0 || isWithdrawing}
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
        >
          {isWithdrawing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Opening Stripe...
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4" />
              Withdraw to Bank
            </>
          )}
        </Button>
        <Button
          onClick={handleDownloadStatement}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download Statement
        </Button>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Trend</CardTitle>
          <CardDescription>Your earnings over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <EarningsChart role="TECHNICIAN" />
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All jobs and earnings from completed work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                    Job
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">
                    Amount
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">
                    Fee
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">
                    Net
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <p className="text-gray-500">No transactions yet</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn, idx) => (
                    <motion.tr
                      key={txn.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 max-w-xs truncate">
                            {txn.jobTitle}
                          </p>
                          <p className="text-xs text-gray-500">ID: {txn.jobId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {txn.date ? new Date(txn.date).toLocaleDateString('en-MY') : '—'}
                        {txn.date && (
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(txn.date!), { addSuffix: true })}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        RM {txn.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        - RM {txn.platformFee.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        RM {txn.netAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {(txn.status === 'COMPLETED' || txn.status === 'RELEASED') && (
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        )}
                        {(txn.status === 'PENDING' || txn.status === 'HELD') && (
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        )}
                        {(txn.status === 'WITHDRAWN' || txn.status === 'REFUNDED') && (
                          <Badge className="bg-blue-100 text-blue-800">Withdrawn</Badge>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">How Payments Work</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Payment is held for 7-14 days after job completion to ensure customer
                  satisfaction
                </li>
                <li>• Platform fee is 20% per completed job</li>
                <li>• You can withdraw available balance anytime to your bank account</li>
                <li>• Withdrawals typically take 1-2 business days to appear in your account</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
