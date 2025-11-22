// src/app/admin/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  BookOpen,
  CreditCard,
  FolderTree,
  TrendingUp,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Total Words",
    value: "1,234",
    change: "+12%",
    icon: BookOpen,
    color: "text-sky-600",
    bgColor: "bg-sky-50",
  },
  {
    title: "Categories",
    value: "45",
    change: "+3%",
    icon: FolderTree,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Card Decks",
    value: "89",
    change: "+8%",
    icon: CreditCard,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Active Users",
    value: "2,345",
    change: "+15%",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="mr-1 h-3 w-3" />
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Words Added</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Word #{i}</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm">Activity log #{i}</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
