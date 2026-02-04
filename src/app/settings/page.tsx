"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/lib/hooks/use-auth";
import { useHabitsStore } from "@/lib/stores/habits-store";
import { useCompletionsStore } from "@/lib/stores/completions-store";
import { useUIStore } from "@/lib/stores/ui-store";
import {
  Download,
  Trash2,
  LogOut,
  User,
  Bell,
  Moon,
  Shield,
  Database,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isAnonymous, signOut } = useAuth();
  const { habits, setHabits } = useHabitsStore();
  const { completions, setCompletions } = useCompletionsStore();
  const { showTips, dismissTips } = useUIStore();

  const handleExportData = () => {
    const data = {
      habits,
      completions,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habit-tracker-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Data exported successfully!");
  };

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to delete all your local data? This cannot be undone."
      )
    ) {
      setHabits([]);
      setCompletions([]);
      localStorage.removeItem("habits-storage");
      localStorage.removeItem("completions-storage");
      toast.success("All local data has been cleared");
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Account section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>
              Manage your account and sync settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAnonymous ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Guest Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Sign up to sync your habits across devices
                  </p>
                </div>
                <Button onClick={() => setShowAuthModal(true)}>
                  Sign Up / Sign In
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="success">Synced</Badge>
                      <span className="text-sm text-muted-foreground">
                        Your data syncs across all devices
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how the app looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose light, dark, or system theme
                </p>
              </div>
              <ThemeToggle />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-tips">Show Tips</Label>
                <p className="text-sm text-muted-foreground">
                  Display helpful tips and suggestions
                </p>
              </div>
              <Switch
                id="show-tips"
                checked={showTips}
                onCheckedChange={(checked) => {
                  if (!checked) dismissTips();
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure reminder notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive reminders for your habits
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if ("Notification" in window) {
                    Notification.requestPermission().then((permission) => {
                      if (permission === "granted") {
                        toast.success("Notifications enabled!");
                      } else {
                        toast.error("Notification permission denied");
                      }
                    });
                  } else {
                    toast.error("Notifications not supported in this browser");
                  }
                }}
              >
                Enable Notifications
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export or delete your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download all your habits and completions as JSON
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-destructive">Delete Local Data</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all local data
                </p>
              </div>
              <Button variant="destructive" onClick={handleClearData}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy
            </CardTitle>
            <CardDescription>
              Your data privacy matters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Local-first:</strong> Your data is stored locally on your
                device by default.
              </p>
              <p>
                <strong>Optional sync:</strong> Sign up to sync data via Supabase
                (encrypted in transit and at rest).
              </p>
              <p>
                <strong>No tracking:</strong> We don&apos;t track your habits or
                personal information.
              </p>
              <p>
                <strong>Export anytime:</strong> Download your data in JSON format
                whenever you want.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* App info */}
        <div className="text-center text-sm text-muted-foreground pb-6">
          <p>Habit Tracker v1.0.0</p>
          <p>Built with Next.js, Supabase, and love</p>
        </div>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}
