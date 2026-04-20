"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePayments } from "@/hooks/usePayments";
import { formatCurrency, formatDateTime, getInitials } from "@/lib/utils";
import { Download, CheckCircle, Clock, XCircle, Copy } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Payment } from "@/types";
import { toast } from "sonner";

export default function PaymentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = {
    status: searchParams.get("status") || "",
    page: Number(searchParams.get("page")) || 1,
  };

  const { data, isLoading } = usePayments(filters);

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      if (key !== "page") params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const handleCopyTransactionId = (transactionId: string) => {
    navigator.clipboard.writeText(transactionId);
    toast.success("Transaction ID copied to clipboard");
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let icon;
        if (status === "COMPLETED") icon = <CheckCircle className="w-4 h-4 text-green-500" />;
        else if (status === "FAILED") icon = <XCircle className="w-4 h-4 text-red-500" />;
        else icon = <Clock className="w-4 h-4 text-amber-500" />;

        return (
          <div className="flex items-center gap-2">
            {icon}
            <StatusBadge type="payment" value={status} />
          </div>
        );
      },
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(user.name, user.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name || user.username}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "property",
      header: "Property",
      cell: ({ row }) => {
        const booking = row.original.booking;
        if (!booking) return <span className="text-gray-400">—</span>;
        return (
          <div>
            <p className="font-medium">{booking.house.name}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => {
        const method = row.original.method;
        return (
          <Badge variant="secondary" className="text-xs">
            {method}
          </Badge>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const status = row.original.status;
        const amount = formatCurrency(row.original.amount);
        return (
          <span
            className={`font-semibold ${
              status === "COMPLETED"
                ? "text-green-600"
                : status === "FAILED"
                ? "text-red-600"
                : "text-amber-600"
            }`}
          >
            {amount}
          </span>
        );
      },
    },
    {
      accessorKey: "transactionId",
      header: "Transaction ID",
      cell: ({ row }) => {
        const transactionId = row.original.transactionId;
        if (!transactionId) return <span className="text-gray-400">—</span>;
        const truncated = `${transactionId.substring(0, 8)}...${transactionId.substring(transactionId.length - 4)}`;
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono">{truncated}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleCopyTransactionId(transactionId)}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
  ];

  // Calculate summary stats
  const summary = data?.payments.reduce(
    (acc, payment) => {
      acc[payment.status] = {
        count: (acc[payment.status]?.count || 0) + 1,
        amount: (acc[payment.status]?.amount || 0) + payment.amount,
      };
      return acc;
    },
    {} as Record<string, { count: number; amount: number }>
  );

  return (
    <div className="p-8">
      <PageHeader
        title="Payments Management"
        description="View all payment transactions"
        actions={
          <Button variant="outline" size="default" onClick={() => toast.info("Export coming soon")}>
            <Download className="w-4 h-4 mr-2" />
            Export Payments
          </Button>
        }
      />

      {/* Summary Stats */}
      {summary && (
        <div className="mb-6 flex flex-wrap gap-4">
          {summary.SUCCESS && (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">Success</span>
              <span className="text-lg font-bold text-green-600">
                {summary.SUCCESS.count} ({formatCurrency(summary.SUCCESS.amount)})
              </span>
            </div>
          )}
          {summary.PENDING && (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-lg font-bold text-amber-600">
                {summary.PENDING.count} ({formatCurrency(summary.PENDING.amount)})
              </span>
            </div>
          )}
          {summary.FAILED && (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">Failed</span>
              <span className="text-lg font-bold text-red-600">
                {summary.FAILED.count} ({formatCurrency(summary.FAILED.amount)})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={!filters.status ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("status", "")}
        >
          All
        </Button>
        <Button
          variant={filters.status === "SUCCESS" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("status", "SUCCESS")}
        >
          Success
        </Button>
        <Button
          variant={filters.status === "PENDING" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("status", "PENDING")}
        >
          Pending
        </Button>
        <Button
          variant={filters.status === "FAILED" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("status", "FAILED")}
        >
          Failed
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.payments || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={(page) => setFilter("page", String(page))}
      />
    </div>
  );
}
