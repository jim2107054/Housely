"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { Send, X, Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { getInitials } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const notificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be at most 100 characters"),
  message: z.string().min(1, "Message is required").max(500, "Message must be at most 500 characters"),
  type: z.enum(["INFO", "WARNING", "SUCCESS", "ERROR"]),
  recipients: z.enum(["all", "specific"]),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      recipients: "all",
      type: "INFO",
    },
  });

  const recipients = watch("recipients");
  const title = watch("title");
  const message = watch("message");
  const type = watch("type");

  // Search users
  const searchUsers = useMutation({
    mutationFn: async (search: string) => {
      const response = await api.get(`/api/admin/users?search=${search}&limit=20`);
      return response.data.users;
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setSearchOpen(true);
    },
  });

  // Send notification
  const sendNotification = useMutation({
    mutationFn: async (data: NotificationFormData & { userIds: string[] }) => {
      const response = await api.post("/api/admin/notifications/send", {
        title: data.title,
        message: data.message,
        type: data.type,
        userIds: data.userIds,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Notification sent successfully");
      reset();
      setSelectedUsers([]);
    },
    onError: () => {
      toast.error("Failed to send notification");
    },
  });

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      searchUsers.mutate(value);
    }
  };

  const addUser = (user: any) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery("");
    setSearchOpen(false);
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const onSubmit = (data: NotificationFormData) => {
    const userIds =
      data.recipients === "all" ? ["ALL"] : selectedUsers.map((u) => u.id);

    if (data.recipients === "specific" && userIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    sendNotification.mutate({ ...data, userIds });
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Send Notifications"
        description="Send notifications to platform users"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Notification Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Recipients */}
                <div className="space-y-3">
                  <Label>Recipients</Label>
                  <RadioGroup
                    value={recipients}
                    onValueChange={(value) => setValue("recipients", value as "all" | "specific")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="font-normal cursor-pointer">
                        All Users
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="specific" id="specific" />
                      <Label htmlFor="specific" className="font-normal cursor-pointer">
                        Specific Users
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* User Search (if specific) */}
                {recipients === "specific" && (
                  <div className="space-y-3">
                    <Label>Search Users</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onFocus={() => setSearchOpen(true)}
                        className="pl-10"
                      />
                    </div>
                    <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                      <PopoverTrigger className="hidden" />

                      <PopoverContent className="w-[400px] p-0" align="start">
                        <ScrollArea className="h-[200px]">
                          {searchResults.length > 0 ? (
                            <div className="p-2">
                              {searchResults.map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => addUser(user)}
                                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded"
                                >
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={user.avatar || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {getInitials(user.name, user.username)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="text-left">
                                    <p className="text-sm font-medium">
                                      {user.name || user.username}
                                    </p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-sm text-gray-500">
                              {searchQuery.length < 2
                                ? "Type at least 2 characters to search"
                                : "No users found"}
                            </div>
                          )}
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedUsers.map((user) => (
                          <Badge key={user.id} variant="secondary" className="pl-3 pr-2 py-1.5">
                            <span className="mr-2">{user.name || user.username}</span>
                            <button
                              type="button"
                              onClick={() => removeUser(user.id)}
                              className="hover:bg-gray-200 rounded p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Notification Type</Label>
                  <Select
                    value={type}
                    onValueChange={(value) => setValue("type", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="WARNING">Warning</SelectItem>
                      <SelectItem value="SUCCESS">Success</SelectItem>
                      <SelectItem value="ERROR">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title">Title</Label>
                    <span className="text-xs text-gray-500">
                      {title?.length || 0}/100
                    </span>
                  </div>
                  <Input
                    id="title"
                    placeholder="Notification title"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="message">Message</Label>
                    <span className="text-xs text-gray-500">
                      {message?.length || 0}/500
                    </span>
                  </div>
                  <Textarea
                    id="message"
                    placeholder="Notification message"
                    rows={5}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit */}
                <Button type="submit" disabled={sendNotification.isPending} className="w-full">
                  {sendNotification.isPending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      type === "INFO"
                        ? "bg-blue-500"
                        : type === "SUCCESS"
                        ? "bg-green-500"
                        : type === "WARNING"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium mb-1">
                      {title || "Notification Title"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {message || "Your notification message will appear here..."}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Just now</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium mb-2">Will be sent to:</p>
                {recipients === "all" ? (
                  <Badge variant="secondary">All Users</Badge>
                ) : selectedUsers.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedUsers.map((user) => (
                      <Badge key={user.id} variant="secondary" className="text-xs">
                        {user.name || user.username}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No users selected</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
