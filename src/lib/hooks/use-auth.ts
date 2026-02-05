"use client";

import { useCallback, useEffect } from "react";
import { useUserStore } from "@/lib/stores/user-store";
import { useHabitsStore } from "@/lib/stores/habits-store";
import { useCompletionsStore } from "@/lib/stores/completions-store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEFAULT_HABITS } from "@/types";
import { toast } from "sonner";

export function useAuth() {
  const { user, isAnonymous, isLoading, setUser, setLoading, clearUser } =
    useUserStore();

  const { habits, setHabits, addHabit } = useHabitsStore();
  const { completions, setCompletions } = useCompletionsStore();

  // Migrate anonymous habits/completions to user account
  const migrateAnonymousData = useCallback(
    async (userId: string) => {
      const supabase = createClient();
      if (!supabase) return;

      const anonymousHabits = habits.filter((h) => !h.userId);
      const anonymousCompletions = completions.filter((c) =>
        anonymousHabits.some((h) => h.id === c.habitId),
      );

      if (anonymousHabits.length === 0) return;

      try {
        // Insert habits with new user_id
        for (const habit of anonymousHabits) {
          const { data: newHabit, error: habitError } = await supabase
            .from("habits")
            .insert({
              user_id: userId,
              name: habit.name,
              emoji: habit.emoji,
              color: habit.color,
              frequency: habit.frequency as unknown as Record<string, unknown>,
              reminder_time: habit.reminderTime,
              reminder_message: habit.reminderMessage,
              category: habit.category,
              archived: habit.archived,
            })
            .select()
            .single();

          if (habitError) throw habitError;

          // Insert completions for this habit
          const habitCompletions = anonymousCompletions.filter(
            (c) => c.habitId === habit.id,
          );

          if (habitCompletions.length > 0 && newHabit) {
            const { error: completionError } = await supabase
              .from("completions")
              .insert(
                habitCompletions.map((c) => ({
                  habit_id: newHabit.id,
                  completed_at: c.completedAt,
                  note: c.note,
                  mood: c.mood,
                  photo_url: c.photoUrl,
                })),
              );

            if (completionError) throw completionError;
          }
        }

        // Clear local anonymous data
        setHabits([]);
        setCompletions([]);

        toast.success("Your habits have been synced to your account!");
      } catch (err) {
        console.error("Migration error:", err);
        toast.error("Failed to sync some habits");
      }
    },
    [habits, completions, setHabits, setCompletions],
  );

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // If Supabase is not configured, stay in anonymous mode
        if (!isSupabaseConfigured) {
          setUser(null);

          // Seed default habits for new users
          if (habits.length === 0) {
            DEFAULT_HABITS.forEach((habit) => {
              addHabit({
                ...habit,
                userId: null,
                reminderTime: null,
                reminderMessage: habit.reminderMessage,
                category: null,
                archived: false,
              });
            });
          }
          return;
        }

        const supabase = createClient();
        if (!supabase) {
          setUser(null);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // Seed default habits for new anonymous users
        if (!user && habits.length === 0) {
          DEFAULT_HABITS.forEach((habit) => {
            addHabit({
              ...habit,
              userId: null,
              reminderTime: null,
              reminderMessage: habit.reminderMessage,
              category: null,
              archived: false,
            });
          });
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes only if Supabase is configured
    if (!isSupabaseConfigured) return;

    const supabase = createClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN" && session?.user) {
        // Migrate anonymous data to user account
        await migrateAnonymousData(session.user.id);
        toast.success("Signed in successfully!");
      }

      if (event === "SIGNED_OUT") {
        clearUser();
        toast.success("Signed out");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [addHabit, clearUser, habits.length, migrateAnonymousData, setLoading, setUser]);

  // Sign in with email
  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Supabase is not configured");
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Sign in failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading],
  );

  // Sign up with email
  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Supabase is not configured");
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Sign up failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading],
  );

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) {
      toast.error("Supabase is not configured");
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
      throw err;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) {
      clearUser();
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      toast.error("Failed to sign out");
      throw err;
    }
  }, [clearUser]);

  return {
    user,
    isAnonymous,
    isLoading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };
}
