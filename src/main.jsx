import React from "react";
import { Toaster } from "react-hot-toast";
import ReactDOM from "react-dom/client";

import { GoogleOAuthProvider } from "@react-oauth/google";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Layouts
import UserLayout from "./components/layout/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// not found
// User Pages
import PromotionsPage from "./pages/promotions/PromotionsPage";
import HomePage from "./pages/home/HomePage";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import PaymentReturnPage from "./components/cart/PaymentReturnPage";

import ShoppingCart from "./components/cart/ShoppingCart";
import CheckoutPage from "./components/cart/CheckoutPage";
// import ReservationPage from "./pages/reservation/ReservationPage"
import AboutPage from "./pages/about/AboutPage";
import ContactPage from "./pages/contact/ContactPage";

import UserOrdersPage from "./pages/user/OrdersPage";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";

// Admin Pages
import PrivateRoute from "./components/common/PrivateRoute";
import Dashboard from "./pages/admin/DashboardPage";

import DishesPage from "./pages/admin/DishesPage";
import TablesPage from "./pages/admin/TablesPage";
import OrdersPage from "./pages/admin/OrdersPage";
import ReportsPage from "./pages/admin/ReportsPage";
import StaffOrdersPage from "./pages/staff/StaffOrdersPage";

import DishDetailPage from "./pages/menu/DishDetailPage";
import AccountSettingsPage from "./pages/user/AccountSettingsPage";
import UsersManagementPage from "./pages/admin/UsersManagementPage";
import CategoriesManagementPage from "./pages/admin/CategoriesManagementPage";

// import OrderDetailPage from './pages/order/OrderDetailPage'
import OrderPage from "./pages/order/OrderPage";
import ReviewPage from "./pages/review/ReviewPage";

import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

import AdvancedSearchPage from "./pages/menu/AdvancedSearchPage";

import LoyaltyProgramPage from "./pages/loyalty/LoyaltyProgramPage";
import AdvancedReservationPage from "./pages/reservation/AdvancedReservationPage";

import BlogPage from "./pages/blog/BlogPage";
import BlogPostDetailPage from "./pages/blog/BlogPostDetailPage";

import AdminCustomerAnalyticsPage from "./pages/admin/AdminCustomerAnalyticsPage";
import AdminPromotionsPage from "./pages/admin/AdminPromotionsPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import ProfilePage from "./pages/admin/ProfilePage";
import RoleGuard from "./components/common/RoleGuard";
import "./index.css";
import "./App.css";
import Forbidden from "./pages/error/forbidden";
import AdminGuard from "./components/common/AdminGuard";
import ForbiddenUser from "./pages/error/ForbiddenUser";
import VerifyPage from "./pages/VerifyOTPPage";
const router = createBrowserRouter([
  {
    path: "/errorstaff",
    element: <Forbidden />,
  },
  {
    path: "/erroruser",
    element: <ForbiddenUser />,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "verify",
    element: <VerifyPage />,
  },
  {
    path: "register",
    element: <RegisterPage />,
  },

  {
    path: "forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/",
    element: (
      <RoleGuard blockRoles={["Q003", "Nhân viên", "Staff", "staff"]}>
        <UserLayout />
      </RoleGuard>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },

      {
        path: "review",
        element: <ReviewPage />,
      },

      {
        path: "cart",
        element: <ShoppingCart />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "payment-return",
        element: <PaymentReturnPage />,
      },

      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      // {
      //   path: "profile",
      //   element: <ProfilePage />,
      // },
      {
        path: "menu/:id",
        element: <DishDetailPage />,
      },

      {
        path: "account-settings",
        element: <AccountSettingsPage />,
      },

      {
        path: "promotions",
        element: <PromotionsPage />,
      },
      {
        path: "orders",
        element: <UserOrdersPage />,
      },

      {
        path: "/menu",
        element: <AdvancedSearchPage />,
      },

      {
        path: "/loyalty-program",
        element: <LoyaltyProgramPage />,
      },
      {
        path: "/reservation",
        element: <AdvancedReservationPage />,
      },
      {
        path: "/blog",
        element: <BlogPage />,
      },
      {
        path: "/blog/:id",
        element: <BlogPostDetailPage />,
      },
    ],
  },

  // Admin routes with sidebar only (no header/footer)
  {
    path: "/admin",
    element: (
      <AdminGuard>
        <PrivateRoute>
          <AdminLayout />
        </PrivateRoute>
      </AdminGuard>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <UsersManagementPage />,
      },

      {
        path: "categories",
        element: <CategoriesManagementPage />,
      },
      {
        path: "dishes",
        element: <DishesPage />,
      },
      {
        path: "tables",
        element: <TablesPage />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "customer-analytics",
        element: <AdminCustomerAnalyticsPage />,
      },
      {
        path: "promotions",
        element: <AdminPromotionsPage />,
      },
      {
        path: "reviews",
        element: <AdminReviewsPage />,
      },
      {
        path: "staff",
        element: <StaffOrdersPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GoogleOAuthProvider clientId="87695933712-4368bbf54fpluhmqm4detrvro03ok39f.apps.googleusercontent.com">
    <React.StrictMode>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </React.StrictMode>
  </GoogleOAuthProvider>
);
