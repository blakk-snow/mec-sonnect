// src/services/authService.ts

type UserRecord = {
  password: string;
  hasAccount: boolean;
};

// Mock user database - In a real app, this would be handled by a backend API
const mockUserDatabase: Record<string, UserRecord> = {
  "teacher_jhs_maths_social": { password: "sir_james_5:26", hasAccount: true },
  "teacher_jhs_science_c_arts": { password: "sir_alfred_10:23", hasAccount: true },
  "teacher_upper_primary_b4": { password: "sir_robin_4:15", hasAccount: true },
  "teacher_upper_primary_b5": { password: "sir_mike_9:25", hasAccount: true },
  "teacher_upper_primary_b6": { password: "all_jhs_teachers", hasAccount: true },
  "teacher_lower_primary_b3": { password: "password123", hasAccount: false },
  "teacher_lower_primary_b2": { password: "password123", hasAccount: true },
  "teacher_lower_primary_b1": { password: "password123", hasAccount: true },
  "teacher_preschool_kg": { password: "password123", hasAccount: true },
  "teacher_preschool_nursery1": { password: "password123", hasAccount: false },
  "teacher_preschool_nursery2": { password: "password123", hasAccount: true },
  "teacher_admin_office": { password: "password123", hasAccount: true },
  "teacher_headmaster_office": { password: "adminpass", hasAccount: true },
};

/**
 * Simulates checking whether a user has an account
 * 
 * In a real application, this would be an API call to the backend
 * 
 * @param teacherId - The ID of the teacher to check
 * @returns Whether the teacher has an account
 */
export const checkAccountExists = async (teacherId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const userData = mockUserDatabase[teacherId];

  if (!userData) {
    throw new Error("User not found");
  }

  return userData.hasAccount;
};

/**
 * Simulates authenticating a user with password
 * 
 * @param teacherId - The ID of the teacher to authenticate
 * @param password - The password to verify
 * @returns Whether authentication was successful
 */
export const authenticateUser = async (teacherId: string, password: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const userData = mockUserDatabase[teacherId];

  if (!userData) {
    throw new Error("User not found");
  }

  if (!userData.hasAccount) {
    return false;
  }

  const isPasswordCorrect = userData.password === password;

  if (isPasswordCorrect) {
    localStorage.setItem("authToken", "mock-jwt-token");
    localStorage.setItem("userId", teacherId);
    return true;
  }

  return false;
};

/**
 * Logs out the current user
 */
export const logoutUser = (): void => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
};

/**
 * Checks if user is authenticated
 * 
 * @returns Whether the user is currently authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("authToken");
};

/**
 * Gets the current user ID if authenticated
 * 
 * @returns The user ID or null if not authenticated
 */
export const getCurrentUserId = (): string | null => {
  return localStorage.getItem("userId");
};
