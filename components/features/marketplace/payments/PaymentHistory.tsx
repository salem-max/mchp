"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Calendar,
  Filter,
  Download,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";

type TransactionType = "payment" | "earning" | "refund" | "payout";
type TransactionStatus = "pending" | "completed" | "failed";

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  date: Date;
  relatedJobId?: string;
}

interface PaymentHistoryProps {
  role?: "CUSTOMER" | "TECHNICIAN";
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800"
};

const typeIcons = {
  payment: <ArrowUpRight className="h-4 w-4 text-red-500" />,
  earning: <ArrowDownLeft className="h-4 w-4 text-green-500" />,
  refund: <ArrowUpRight className="h-4 w-4 text-blue-500" />,
  payout: <ArrowDownLeft className="h-4 w-4 text-purple-500" />
};

export default function PaymentHistory({ role = "CUSTOMER" }: PaymentHistoryProps) {
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Get transactions
  const { data: transactions, isLoading, error } = trpc.payment.getTransactions.useQuery({
    role: role as any,
    type: typeFilter !== "ALL" ? (typeFilter as TransactionType) : undefined,
    status: statusFilter !== "ALL" ? (statusFilter as TransactionStatus) : undefined
  });

  // Get summary
  const { data: summary } = trpc.payment.getTransactionsSummary.useQuery({
    role: role as any
  });

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium mb-2">Unable to Load Transactions</h3>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const transactionList = transactions || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total {role === "CUSTOMER" ? "Spent" : "Earned"}</p>
                  <p className="text-2xl font-bold">
                    {summary.currency} {summary.total.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {summary.currency} {summary.pending.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">This Month</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.currency} {summary.thisMonth.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your payments and earnings</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="earning">Earnings</SelectItem>
                <SelectItem value="refund">Refunds</SelectItem>
                <SelectItem value="payout">Payouts</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i: any) => (
                <Skeleton key={i} className="h-12 rounded" />
              ))}
            </div>
          ) : transactionList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No transactions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionList.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="text-center">
                      {typeIcons[transaction.type]}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        {transaction.relatedJobId && (
                          <p className="text-xs text-muted-foreground">
                            Job #{transaction.relatedJobId}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className={transaction.type === "earning" || transaction.type === "payout" ? "text-green-600" : "text-red-600"}>
                        {transaction.type === "earning" || transaction.type === "payout" ? "+" : "-"}
                        {transaction.currency} {transaction.amount.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[transaction.status]}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
