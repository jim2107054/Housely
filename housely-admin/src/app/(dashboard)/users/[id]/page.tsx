"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useUser, useUpdateUserRole, useVerifyUser, useDeleteUser } from "@/hooks/useUsers";
import { getInitials, formatDate } from "@/lib/utils";
import { ArrowLeft, Home, Calendar, Star, Trash2 } from "lucide-react";
import { useState } from "react";

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: user, isLoading } = useUser(params.id);
  const updateRole = useUpdateUserRole();
  const verifyUser = useVerifyUser();
  const deleteUser = useDeleteUser();

  const [selectedRole, setSelectedRole] = useState(user?.role || "USER");

  if (isLoading) {
    return (
      <div>
        <PageHeader title="User Details" description="Loading..." />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <PageHeader title="User Not Found" />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">User not found or has been deleted.</p>
            <Button className="mt-4" onClick={() => router.push("/users")}>
              Back to Users
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRoleUpdate = async () => {
    if (selectedRole !== user.role) {
      await updateRole.mutateAsync({ userId: user.id, role: selectedRole });
    }
  };

  const handleVerificationToggle = async (checked: boolean) => {
    await verifyUser.mutateAsync(user.id);
  };

  const handleDelete = async () => {
    await deleteUser.mutateAsync(user.id);
    router.push("/users");
  };

  return (
    <div>
      <PageHeader
        title="User Details"
        description={`@${user.username}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push("/users")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 mb-4">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="text-xl">
                    {getInitials(user.name, user.username)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">{user.name || user.username}</h2>
                <p className="text-sm text-gray-500 mb-2">@{user.username}</p>
                <div className="flex gap-2 mb-4">
                  <StatusBadge type="role" value={user.role} />
                  {user.isVerified && (
                    <Badge className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                {user.phoneNumber && (
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{user.phoneNumber}</p>
                  </div>
                )}
                {user.dateOfBirth && (
                  <div>
                    <p className="text-gray-500">Date of Birth</p>
                    <p className="font-medium">{formatDate(user.dateOfBirth)}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Joined</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              {user.bio && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bio</p>
                    <p className="text-sm">{user.bio}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          {user._count && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Home className="w-4 h-4" />
                    <span>Houses</span>
                  </div>
                  <span className="font-semibold">{user._count.houses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Bookings</span>
                  </div>
                  <span className="font-semibold">{user._count.bookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4" />
                    <span>Reviews</span>
                  </div>
                  <span className="font-semibold">{user._count.reviews}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Admin Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Change Role */}
          <Card>
            <CardHeader>
              <CardTitle>Change User Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => value && setSelectedRole(value as "ADMIN" | "USER" | "AGENT")}
                  disabled={updateRole.isPending}
                >
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
              <Button
                onClick={handleRoleUpdate}
                disabled={selectedRole === user.role || updateRole.isPending}
              >
                {updateRole.isPending ? "Updating..." : "Update Role"}
              </Button>
            </CardContent>
          </Card>

          {/* Verification */}
          <Card>
            <CardHeader>
              <CardTitle>Account Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="verify">Verification Status</Label>
                  <p className="text-sm text-gray-500">
                    Verified accounts have full platform access
                  </p>
                </div>
                <Switch
                  id="verify"
                  checked={user.isVerified}
                  onCheckedChange={handleVerificationToggle}
                  disabled={verifyUser.isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete this user account, including all their data, bookings,
                reviews, and messages. This action cannot be undone.
              </p>
              <ConfirmDialog
                trigger={
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User
                  </Button>
                }
                title="Delete User Account"
                description={`This will permanently delete ${
                  user.name || user.username
                }'s account, all their bookings, reviews, and messages. This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
