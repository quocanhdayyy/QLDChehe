// Auth routes
export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
};

// Leader routes
export const LEADER_ROUTES = {
  DASHBOARD: "/leader/dashboard",
  HOUSEHOLDS: "/leader/households",
  HOUSEHOLD_DETAIL: (id) => `/leader/households/${id}`,
  HOUSEHOLD_CREATE: "/leader/households/create",
  HOUSEHOLD_EDIT: (id) => `/leader/households/${id}/edit`,
  CITIZENS: "/leader/citizens",
  CITIZEN_DETAIL: (id) => `/leader/citizens/${id}`,
  CITIZEN_CREATE: "/leader/citizens/create",
  CITIZEN_EDIT: (id) => `/leader/citizens/${id}/edit`,
  EDIT_REQUESTS: "/leader/edit-requests",
  EDIT_REQUEST_DETAIL: (id) => `/leader/edit-requests/${id}`,
  REWARD_PROPOSALS: "/leader/reward-proposals",
  REWARD_PROPOSAL_DETAIL: (id) => `/leader/reward-proposals/${id}`,
  REWARD_EVENTS: "/leader/reward-events",
  REWARD_EVENT_DETAIL: (id) => `/leader/reward-events/${id}`,
  REWARD_EVENT_CREATE: "/leader/reward-events/create",
  REWARD_DISTRIBUTIONS: "/leader/reward-distributions",
  REWARD_DISTRIBUTION_DETAIL: (id) => `/leader/reward-distributions/${id}`,
  STUDENT_ACHIEVEMENTS: "/leader/student-achievements",
  STUDENT_ACHIEVEMENT_DETAIL: (id) => `/leader/student-achievements/${id}`,
  AUDIT_LOGS: "/leader/audit-logs",
};

// Citizen routes
export const CITIZEN_ROUTES = {
  DASHBOARD: "/citizen/dashboard",
  HOUSEHOLD: "/citizen/household",
  SUBMIT_EDIT_REQUEST: "/citizen/submit-edit-request",
  MY_REQUESTS: "/citizen/my-requests",
  REQUEST_DETAIL: (id) => `/citizen/my-requests/${id}`,
  SUBMIT_REWARD_PROPOSAL: "/citizen/submit-reward-proposal",
  MY_REWARDS: "/citizen/my-rewards",
  REWARD_DETAIL: (id) => `/citizen/my-rewards/${id}`,
};

// Shared routes
export const SHARED_ROUTES = {
  PROFILE: "/profile",
  NOTIFICATIONS: "/notifications",
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/unauthorized",
};
