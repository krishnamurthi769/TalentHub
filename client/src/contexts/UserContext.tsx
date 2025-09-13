import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface UserContextType {
  userProfile: User | null;
  loading: boolean;
  error: string | null;
  refetchUser: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (): Promise<User | undefined> => {
    if (!user) return undefined;
    
    try {
      const response = await apiRequest("GET", "/api/user/profile");
      return await response.json();
    } catch (err: any) {
      // If user not found (404), it means the user hasn't been registered in our database yet
      if (err.message?.includes("404") || err.message?.includes("User not found")) {
        // Try to create the user profile
        try {
          const createUserResponse = await apiRequest("POST", "/api/user/create", {
            firebaseUid: user.uid,
            email: user.email,
            displayName: user.displayName || "Anonymous User",
            photoURL: user.photoURL,
            role: "athlete", // Default role
            sport: null,
            skillLevel: null,
            location: null,
            age: null,
          });
          
          const newUser = await createUserResponse.json();
          return newUser;
        } catch (createErr: any) {
          console.error("Error creating user profile:", createErr);
          throw new Error("Failed to create user profile: " + (createErr.message || "Unknown error"));
        }
      }
      throw err;
    }
  };

  const { 
    data: userProfile, 
    isLoading, 
    isError, 
    error: queryError,
    refetch 
  } = useQuery<User | undefined>({
    queryKey: ["/api/user/profile"],
    queryFn: fetchUserProfile,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once to avoid infinite loading
  });

  useEffect(() => {
    if (isError && queryError) {
      setError(queryError.message || "Failed to load user profile");
    }
  }, [isError, queryError]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      setError(null);
    },
    onError: (err: Error) => {
      console.error("Error updating user profile:", err);
      setError(err.message || "Failed to update user profile");
    }
  });

  const updateUserProfile = async (data: Partial<User>) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const refetchUser = () => {
    setError(null);
    refetch();
  };

  return (
    <UserContext.Provider 
      value={{ 
        userProfile: userProfile || null, 
        loading: isLoading, 
        error,
        refetchUser, 
        updateUserProfile 
      }}
    >
      {children}
    </UserContext.Provider>
  );
}