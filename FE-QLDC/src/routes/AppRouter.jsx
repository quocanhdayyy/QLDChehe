"use client";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";

// Public Pages
import HomePage from "../pages/HomePage";

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";

// Dashboard Pages
import LeaderDashboard from "../pages/dashboard/LeaderDashboard";
import CitizenDashboard from "../pages/dashboard/CitizenDashboard";

// Leader Pages (Old - sẽ migrate dần)
import HouseholdManagement from "../pages/leader/HouseholdManagement";
import CitizenManagement from "../pages/leader/CitizenManagement";
import EditRequestReview from "../pages/leader/EditRequestReview";
import RewardProposalReview from "../pages/leader/RewardProposalReview";
import AuditLogs from "../pages/leader/AuditLogs";
import GiftEventsList from "../pages/leader/GiftEventsList";
import GiftEventCreate from "../pages/leader/GiftEventCreate";
import GiftRegistrations from "../pages/leader/GiftRegistrations";
import GiftEventDetail from "../pages/leader/GiftEventDetail";

// Citizen Pages (Old - sẽ migrate dần)
import MyHousehold from "../pages/citizen/MyHousehold";
import SubmitEditRequest from "../pages/citizen/SubmitEditRequest";
import SubmitRewardProposal from "../pages/citizen/SubmitRewardProposal";
import MyRequests from "../pages/citizen/MyRequests";
import MyRewards from "../pages/citizen/MyRewards";
import EventsList from "../pages/events/EventsList";
import MyRegistrations from "../pages/events/MyRegistrations";

// Error Pages
import NotFoundPage from "../pages/errors/NotFoundPage";
import UnauthorizedPage from "../pages/errors/UnauthorizedPage";

const AppRouter = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Leader Routes */}
        <Route
          path="/leader/dashboard"
          element={
            <ProtectedRoute requiredRole="leader">
              <LeaderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leader/households"
          element={
            <ProtectedRoute requiredRole="leader">
              <HouseholdManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leader/citizens"
          element={
            <ProtectedRoute requiredRole="leader">
              <CitizenManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leader/edit-requests"
          element={
            <ProtectedRoute requiredRole="leader">
              <EditRequestReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leader/reward-proposals"
          element={
            <ProtectedRoute requiredRole="leader">
              <RewardProposalReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leader/audit-logs"
          element={
            <ProtectedRoute requiredRole="leader">
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leader/gift-events"
          element={
            <ProtectedRoute requiredRole="leader">
              <GiftEventsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leader/gift-events/create"
          element={
            <ProtectedRoute requiredRole="leader">
              <GiftEventCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leader/gift-events/:id"
          element={
            <ProtectedRoute requiredRole="leader">
              <GiftEventDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leader/gift-events/:id/registrations"
          element={
            <ProtectedRoute requiredRole="leader">
              <GiftRegistrations />
            </ProtectedRoute>
          }
        />

        {/* Citizen Routes */}
        <Route
          path="/citizen/dashboard"
          element={
            <ProtectedRoute requiredRole="citizen">
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/household"
          element={
            <ProtectedRoute requiredRole="citizen">
              <MyHousehold />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/submit-edit-request"
          element={
            <ProtectedRoute requiredRole="citizen">
              <SubmitEditRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/submit-reward-proposal"
          element={
            <ProtectedRoute requiredRole="citizen">
              <SubmitRewardProposal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/my-requests"
          element={
            <ProtectedRoute requiredRole="citizen">
              <MyRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/my-rewards"
          element={
            <ProtectedRoute requiredRole="citizen">
              <MyRewards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute requiredRole="citizen">
              <EventsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/my-registrations"
          element={
            <ProtectedRoute requiredRole="citizen">
              <MyRegistrations />
            </ProtectedRoute>
          }
        />

        {/* Root redirect based on user role */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={
                  user.role === "TO_TRUONG"
                    ? "/leader/dashboard"
                    : "/citizen/dashboard"
                }
                replace
              />
            ) : (
              <HomePage />
            )
          }
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
