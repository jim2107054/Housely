"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useUsers, useUpdateUserRole, useVerifyUser, useDeleteUser } from "@/hooks/useUsers";
import { getInitials, formatDate } from "@/lib/utils";
import { Search, MoreHorizontal, CheckCircle, XCircle, Download } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types";
import Link from "next/link";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

export default function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchInput, 300);

  const filters = {
    role: searchParams.get("role") || "",
    isVerified: searchParams.get("isVerified") || "",
    search: debouncedSearch,
    page: Number(searchParams.get("page")) || 1,
  };

  const { data, isLoading } = useUsers(filters);
  const updateRole = useUpdateUserRole();
  const verifyUser = useVerifyUser();
  const deleteUser = useDeleteUser();

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>("");

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

  const handleRoleChange = async () => {
    if (selectedUser && newRole) {
      await updateRole.mutateAsync({ userId: selectedUser.id, role: newRole });
      setRoleDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback>{getInitials(user.name, user.username)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name || user.username}</p>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => row.original.phoneNumber || "—",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <StatusBadge type="role" value={row.original.role} />,
    },
    {
      accessorKey: "isVerified",
      header: "Verified",
      cell: ({ row }) =>
        row.original.isVerified ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/users/${user.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(user);
                  setNewRole(user.role);
                  setRoleDialogOpen(true);
                }}
              >
                Change Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => verifyUser.mutate(user.id)}>
                Toggle Verification
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ConfirmDialog
                trigger={
                  <button className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-600 outline-none transition-colors hover:bg-accent hover:text-red-700">
                    Delete User
                  </button>
                }
                title="Delete User"
                description={`Are you sure you want to delete ${user.name || user.username}? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={() => deleteUser.mutate(user.id)}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Users Management"
        description="Manage all platform users, agents, and administrators"
        actions={
          <Button variant="outline" size="default" onClick={() => toast.info("Export coming soon")}>
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name, email, or username..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            className="pl-11"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!filters.role ? "default" : "outline"}
            size="default"
            onClick={() => setFilter("role", "")}
          >
            All
          </Button>
          <Button
            variant={filters.role === "USER" ? "default" : "outline"}
            size="default"
            onClick={() => setFilter("role", "USER")}
          >
            Users
          </Button>
          <Button
            variant={filters.role === "AGENT" ? "default" : "outline"}
            size="default"
            onClick={() => setFilter("role", "AGENT")}
          >
            Agents
          </Button>
          <Button
            variant={filters.role === "ADMIN" ? "default" : "outline"}
            size="default"
            onClick={() => setFilter("role", "ADMIN")}
          >
            Admins
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.isVerified === "true" ? "default" : "outline"}
            size="default"
            onClick={() => setFilter("isVerified", filters.isVerified === "true" ? "" : "true")}
          >
            ✓ Verified
          </Button>
          <Button
            variant={filters.isVerified === "false" ? "default" : "outline"}
            size="default"
            onClick={() => setFilter("isVerified", filters.isVerified === "false" ? "" : "false")}
          >
            ✗ Unverified
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.users || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={(page) => setFilter("page", String(page))}
      />

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.name || selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">User Role</Label>
              <Select value={newRole} onValueChange={(value) => value && setNewRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="AGENT">AGENT</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={updateRole.isPending}>
              {updateRole.isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
