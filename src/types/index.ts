/**
 * @file types/index.ts
 * @description Shared TypeScript type definitions for the HOPE PMS application.
 *
 * Note: `CourseNode` and `MapEdge` are legacy types from an earlier project scope.
 * They are not actively used by the Product Management System but are preserved
 * here for potential future curriculum-mapping features.
 */

/** Possible roles a user can hold within the academic system. */
export type UserRole = 'student' | 'faculty' | 'admin';

/**
 * Represents a user's profile as stored in the application database.
 * This is separate from the Supabase Auth `User` object.
 */
export interface UserProfile {
  /** UUID primary key from the `users` table. */
  id: string;
  /** User's institutional email address. */
  email: string;
  /** The user's assigned role within the system. */
  role: UserRole;
  /** ISO-8601 timestamp of when the profile was created. */
  created_at: string;
}

/**
 * Represents a course in the curriculum mapping graph.
 * @deprecated Not actively used by the Product Management System.
 */
export interface CourseNode {
  id: string;
  code: string;
  title: string;
  description?: string;
  credits: number;
}

/**
 * Represents a directed edge between two courses in the curriculum graph.
 * @deprecated Not actively used by the Product Management System.
 */
export interface MapEdge {
  id: string;
  /** The prerequisite course ID (edge origin). */
  source_id: string;
  /** The course that requires the prerequisite (edge destination). */
  target_id: string;
  /** The nature of the dependency between courses. */
  type: 'prerequisite' | 'corequisite' | 'recommended';
}
