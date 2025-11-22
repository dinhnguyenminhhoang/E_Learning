"use client";

import { useEffect, useState } from "react";
import {
  fakeProfileService,
  UserProfile,
  Achievement,
  LearningStat,
} from "@/services/fakeProfile.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Medal,
  Flame,
  Clock,
  BookOpen,
  Settings,
  User,
  BarChart3,
  Edit,
  Camera,
  LogOut,
  Bell,
  Volume2,
  Moon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<LearningStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Edit form state
  const [editForm, setEditForm] = useState({
    displayName: "",
    phoneNumber: "",
    birthday: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileData, achievementsData, statsData] = await Promise.all([
        fakeProfileService.getProfile(),
        fakeProfileService.getAchievements(),
        fakeProfileService.getStats(),
      ]);

      setProfile(profileData);
      setAchievements(achievementsData);
      setStats(statsData);

      setEditForm({
        displayName: profileData.displayName,
        phoneNumber: profileData.phoneNumber,
        birthday: profileData.birthday,
        bio: profileData.bio || "",
      });
    } catch (error) {
      console.error("Failed to fetch profile data", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updated = await fakeProfileService.updateProfile(editForm);
      setProfile(updated);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/signin");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-lg cursor-pointer">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback className="text-3xl bg-blue-600 text-white">
                  {profile.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
                <Camera className="h-4 w-4 text-gray-600" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {profile.displayName}
              </h1>
              <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2">
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium border border-yellow-200">
                  {profile.rank}
                </span>
                <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
              </p>

              <div className="max-w-md mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Level {profile.level}</span>
                  <span className="text-gray-500">{profile.xp} / {profile.nextLevelXp} XP</span>
                </div>
                <Progress value={(profile.xp / profile.nextLevelXp) * 100} className="h-2" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Awards</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Flame className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{profile.streak}</div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Day Streak</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{profile.totalWordsLearned}</div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Words Learned</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{Math.floor(profile.totalTimeSpent / 60)}h</div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Time Spent</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{achievements.filter(a => a.isUnlocked).length}</div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Achievements</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Chart (Fake Visual) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Learning Activity
                </CardTitle>
                <CardDescription>Your learning progress over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-end justify-between gap-2 pt-4">
                  {stats.map((stat, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div
                        className="w-full bg-blue-100 rounded-t-md relative group-hover:bg-blue-200 transition-colors"
                        style={{ height: `${Math.min(stat.time * 2, 100)}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {stat.time} mins
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACHIEVEMENTS TAB */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`${!achievement.isUnlocked ? 'opacity-60 bg-gray-50' : 'border-yellow-200 bg-yellow-50/30'}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={`p-3 rounded-full ${achievement.isUnlocked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'}`}>
                      <span className="text-2xl">{achievement.icon}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                        {achievement.isUnlocked && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progress</span>
                          <span>{achievement.progress} / {achievement.total}</span>
                        </div>
                        <Progress value={(achievement.progress / achievement.total) * 100} className="h-1.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* EDIT PROFILE TAB */}
          <TabsContent value="edit">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.email} disabled className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={editForm.birthday}
                    onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Manage your app settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <Bell className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">Notifications</p>
                      <p className="text-sm text-gray-500">Receive daily reminders</p>
                    </div>
                  </div>
                  <div className="h-6 w-11 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="absolute top-1 right-1 h-4 w-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <Volume2 className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">Sound Effects</p>
                      <p className="text-sm text-gray-500">Play sounds during lessons</p>
                    </div>
                  </div>
                  <div className="h-6 w-11 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="absolute top-1 right-1 h-4 w-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <Moon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-gray-500">Switch to dark theme</p>
                    </div>
                  </div>
                  <div className="h-6 w-11 bg-gray-200 rounded-full relative cursor-pointer">
                    <div className="absolute top-1 left-1 h-4 w-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-red-600 mb-4">Danger Zone</h3>
                  <Button variant="destructive" className="w-full sm:w-auto">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}