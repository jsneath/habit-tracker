"use client";

import { useMemo } from "react";
import {
  format,
  subDays,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StreakBadge } from "@/components/shared/streak-badge";
import { Flame, TrendingUp, Target, Trophy, Calendar } from "lucide-react";
import { useHabitsStore } from "@/lib/stores/habits-store";
import { useCompletionsStore } from "@/lib/stores/completions-store";
import { getCompletionPercentage, getDateKey, calculateStreak } from "@/lib/utils";

export default function StatsPage() {
  const { getActiveHabits } = useHabitsStore();
  const { completions, getCompletionDatesForHabit } = useCompletionsStore();

  const activeHabits = getActiveHabits();

  // Calculate stats for different time periods
  const stats = useMemo(() => {
    const today = new Date();
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });
    const last30Days = eachDayOfInterval({
      start: subDays(today, 29),
      end: today,
    });

    // Weekly completion data for chart
    const weeklyData = last7Days.map((date) => {
      const dateKey = getDateKey(date);
      const completed = completions.filter(
        (c) => c.completedAt === dateKey
      ).length;
      return {
        name: format(date, "EEE"),
        completed,
        total: activeHabits.length,
        rate: getCompletionPercentage(completed, activeHabits.length),
      };
    });

    // 30-day trend data
    const trendData = last30Days.map((date) => {
      const dateKey = getDateKey(date);
      const completed = completions.filter(
        (c) => c.completedAt === dateKey
      ).length;
      return {
        name: format(date, "MM/dd"),
        rate: getCompletionPercentage(completed, activeHabits.length),
      };
    });

    // Overall stats
    const last7Completions = completions.filter((c) =>
      last7Days.some((d) => getDateKey(d) === c.completedAt)
    ).length;
    const last30Completions = completions.filter((c) =>
      last30Days.some((d) => getDateKey(d) === c.completedAt)
    ).length;

    const rate7Days = getCompletionPercentage(
      last7Completions,
      activeHabits.length * 7
    );
    const rate30Days = getCompletionPercentage(
      last30Completions,
      activeHabits.length * 30
    );

    // Previous period comparison
    const prev7Days = eachDayOfInterval({
      start: subDays(today, 13),
      end: subDays(today, 7),
    });
    const prev7Completions = completions.filter((c) =>
      prev7Days.some((d) => getDateKey(d) === c.completedAt)
    ).length;
    const prevRate7Days = getCompletionPercentage(
      prev7Completions,
      activeHabits.length * 7
    );
    const trendDiff = rate7Days - prevRate7Days;

    // Per-habit stats
    const habitStats = activeHabits.map((habit) => {
      const habitCompletions = completions.filter(
        (c) => c.habitId === habit.id
      );
      const dates = habitCompletions.map((c) => c.completedAt);
      const currentStreak = calculateStreak(dates);

      // Calculate longest streak
      const sortedDates = [...dates].sort();
      let longestStreak = 0;
      let tempStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      const last7 = habitCompletions.filter((c) =>
        last7Days.some((d) => getDateKey(d) === c.completedAt)
      ).length;

      return {
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        color: habit.color,
        currentStreak,
        longestStreak: dates.length > 0 ? longestStreak : 0,
        total: habitCompletions.length,
        rate7Days: getCompletionPercentage(last7, 7),
      };
    });

    return {
      weeklyData,
      trendData,
      rate7Days,
      rate30Days,
      trendDiff,
      totalCompletions: completions.length,
      habitStats: habitStats.sort((a, b) => b.currentStreak - a.currentStreak),
    };
  }, [activeHabits, completions]);

  // Generate insight message
  const insight = useMemo(() => {
    if (stats.trendDiff > 10) {
      return `You're ${stats.trendDiff}% more consistent this week - amazing progress!`;
    } else if (stats.trendDiff > 0) {
      return `Up ${stats.trendDiff}% from last week - keep it going!`;
    } else if (stats.trendDiff === 0) {
      return "Steady consistency - you're building strong habits!";
    } else {
      return "Room to grow - tomorrow is a new opportunity!";
    }
  }, [stats.trendDiff]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground">
          Track your progress and celebrate your wins
        </p>
      </div>

      {/* Insight card */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">{insight}</p>
            <p className="text-sm text-muted-foreground">
              Based on your last 7 days vs previous week
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              7-Day Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.rate7Days}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              30-Day Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.rate30Days}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Total Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalCompletions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Best Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Math.max(0, ...stats.habitStats.map((h) => h.longestStreak))} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly chart */}
      <Card>
        <CardHeader>
          <CardTitle>Last 7 Days</CardTitle>
          <CardDescription>Daily completion count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  className="text-xs fill-muted-foreground"
                />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border rounded-lg p-2 shadow-md">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.completed} / {data.total} ({data.rate}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="completed"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 30-day trend */}
      <Card>
        <CardHeader>
          <CardTitle>30-Day Trend</CardTitle>
          <CardDescription>Daily completion rate over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  className="text-xs fill-muted-foreground"
                  interval={6}
                />
                <YAxis
                  className="text-xs fill-muted-foreground"
                  domain={[0, 100]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border rounded-lg p-2 shadow-md">
                          <p className="font-medium">{payload[0].payload.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {payload[0].value}% completion
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Per-habit breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Habit Breakdown</CardTitle>
          <CardDescription>Individual habit performance</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.habitStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Add habits to see stats here
            </p>
          ) : (
            <div className="space-y-4">
              {stats.habitStats.map((habit) => (
                <div key={habit.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{habit.emoji}</span>
                      <span className="font-medium">{habit.name}</span>
                      <StreakBadge streak={habit.currentStreak} size="sm" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {habit.rate7Days}% (7d)
                    </span>
                  </div>
                  <Progress value={habit.rate7Days} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current: {habit.currentStreak} days</span>
                    <span>Best: {habit.longestStreak} days</span>
                    <span>Total: {habit.total} check-ins</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
