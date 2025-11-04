// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",
};

// User endpoints
export const USER_ENDPOINTS = {
  GET_ALL: "/users",
  GET_BY_ID: (id) => `/users/${id}`,
  CREATE: "/users",
  UPDATE: (id) => `/users/${id}`,
  DELETE: (id) => `/users/${id}`,
};

// Household endpoints
export const HOUSEHOLD_ENDPOINTS = {
  GET_ALL: "/households",
  GET_BY_ID: (id) => `/households/${id}`,
  CREATE: "/households",
  UPDATE: (id) => `/households/${id}`,
  DELETE: (id) => `/households/${id}`,
};

// Citizen endpoints
export const CITIZEN_ENDPOINTS = {
  GET_ALL: "/citizens",
  GET_BY_ID: (id) => `/citizens/${id}`,
  CREATE: "/citizens",
  UPDATE: (id) => `/citizens/${id}`,
  DELETE: (id) => `/citizens/${id}`,
};

// Edit Request endpoints
export const EDIT_REQUEST_ENDPOINTS = {
  GET_ALL: "/requests",
  GET_BY_ID: (id) => `/requests/${id}`,
  CREATE: "/requests",
  UPDATE: (id) => `/requests/${id}`,
  DELETE: (id) => `/requests/${id}`,
  APPROVE: (id) => `/requests/${id}/approve`,
  REJECT: (id) => `/requests/${id}/reject`,
};

// Reward Proposal endpoints
export const REWARD_PROPOSAL_ENDPOINTS = {
  GET_ALL: "/rewards",
  GET_BY_ID: (id) => `/rewards/${id}`,
  CREATE: "/rewards",
  UPDATE: (id) => `/rewards/${id}`,
  DELETE: (id) => `/rewards/${id}`,
  APPROVE: (id) => `/rewards/${id}/approve`,
  REJECT: (id) => `/rewards/${id}/reject`,
};

// Reward Event endpoints
export const REWARD_EVENT_ENDPOINTS = {
  GET_ALL: "/reward-events",
  GET_BY_ID: (id) => `/reward-events/${id}`,
  CREATE: "/reward-events",
  UPDATE: (id) => `/reward-events/${id}`,
  DELETE: (id) => `/reward-events/${id}`,
};

// Gift Events (phát quà)
export const GIFT_EVENT_ENDPOINTS = {
  GET_ALL: "/gift-events",
  GET_BY_ID: (id) => `/gift-events/${id}`,
  CREATE: "/gift-events",
  UPDATE: (id) => `/gift-events/${id}`,
  DELETE: (id) => `/gift-events/${id}`,
  CLOSE: (id) => `/gift-events/${id}/close`,
  OPEN: (id) => `/gift-events/${id}/open`,
  REGISTER: (id) => `/gift-events/${id}/register`,
  REGISTRATIONS: (id) => `/gift-events/${id}/registrations`,
  REGISTRATIONS_EXPORT: (id) => `/gift-events/${id}/registrations/export`,
  REGISTRATIONS_MINE: "/gift-events/registrations/mine",
  REGISTRATION_SCAN: `/gift-events/registrations/scan`,
};

// Reward Distribution endpoints
export const REWARD_DISTRIBUTION_ENDPOINTS = {
  GET_ALL: "/reward-distributions",
  GET_BY_ID: (id) => `/reward-distributions/${id}`,
  CREATE: "/reward-distributions",
  BULK_CREATE: "/reward-distributions/bulk",
  UPDATE: (id) => `/reward-distributions/${id}`,
  DELETE: (id) => `/reward-distributions/${id}`,
  SUMMARY: (eventId) => `/reward-distributions/summary/event/${eventId}`,
};

// Student Achievement endpoints
export const STUDENT_ACHIEVEMENT_ENDPOINTS = {
  GET_ALL: "/student-achievements",
  GET_BY_ID: (id) => `/student-achievements/${id}`,
  CREATE: "/student-achievements",
  UPDATE: (id) => `/student-achievements/${id}`,
  DELETE: (id) => `/student-achievements/${id}`,
};

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  GET_ALL: "/notifications",
  GET_BY_ID: (id) => `/notifications/${id}`,
  CREATE: "/notifications",
  UPDATE: (id) => `/notifications/${id}`,
  DELETE: (id) => `/notifications/${id}`,
  MARK_AS_READ: (id) => `/notifications/${id}/read`,
};

// Audit Log endpoints
export const AUDIT_LOG_ENDPOINTS = {
  GET_ALL: "/audit",
  GET_BY_ID: (id) => `/audit/${id}`,
};
