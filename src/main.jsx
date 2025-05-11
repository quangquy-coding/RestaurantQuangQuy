import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Toaster } from "react-hot-toast"
// Layouts
import UserLayout from "./components/layout/UserLayout"
import AdminLayout from "./layouts/AdminLayout"

// User Pages
import HomePage from "./pages/home/HomePage"


import ShoppingCart from "./components/cart/ShoppingCart"
import CheckoutPage from "./components/cart/CheckoutPage"
// import ReservationPage from "./pages/reservation/ReservationPage"
import AboutPage from "./pages/about/AboutPage"
import ContactPage from "./pages/contact/ContactPage"
import ProfilePage from "./pages/user/ProfilePage"
import UserOrdersPage from "./pages/user/OrdersPage"
import LoginPage from "./pages/login"
import RegisterPage from "./pages/register"




// Admin Pages
import PrivateRoute from "./components/common/PrivateRoute"
import Dashboard from "./pages/admin/DashboardPage"

import DishesPage from "./pages/admin/DishesPage"
import TablesPage from "./pages/admin/TablesPage"
import OrdersPage from "./pages/admin/OrdersPage"
import ReportsPage from "./pages/admin/ReportsPage"
import StaffOrdersPage from "./pages/staff/StaffOrdersPage"

import DishDetailPage from "./pages/menu/DishDetailPage"
import AccountSettingsPage from "./pages/user/AccountSettingsPage"
import UsersManagementPage from "./pages/admin/UsersManagementPage"
import CategoriesManagementPage from "./pages/admin/CategoriesManagementPage"


// import OrderDetailPage from './pages/order/OrderDetailPage'
import OrderPage from './pages/order/OrderPage'
import ReviewPage from './pages/review/ReviewPage'

import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"


import AdvancedSearchPage from "./pages/menu/AdvancedSearchPage"

import LoyaltyProgramPage from "./pages/loyalty/LoyaltyProgramPage"
import AdvancedReservationPage from "./pages/reservation/AdvancedReservationPage" 

import BlogPage from "./pages/blog/BlogPage"
import BlogPostDetailPage from "./pages/blog/BlogPostDetailPage"
 
import AdminCustomerAnalyticsPage from "./pages/admin/AdminCustomerAnalyticsPage"
import AdminPromotionsPage from './pages/admin/AdminPromotionsPage'
import AdminReviewsPage from './pages/admin/AdminReviewsPage'



import "./index.css"
import "./App.css"

const router = createBrowserRouter([

  {
    path: "/",
    element: <UserLayout />,
    children: [
      
      {
        index: true,
        element: <HomePage />,
      },
     
      // {
      //   path: "order",
      //   element: <OrderPage />,
      // },
      // {
      //   path: "order",
      //   element: <OrderPage />,
      // },
      {
        path: "review",
        element: <ReviewPage />,
      },
      // {
      //   path: "order/:id",
      //   element: <OrderDetailPage />,
      // },
      
      {
        path: "cart",
        element: <ShoppingCart />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      // {
      //   path: "reservation",
      //   element: <ReservationPage />,
      // },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "menu/:id",
        element: <DishDetailPage />,
      },
   
      // {
      //   path: "categories-management",
      //   element: <CategoriesManagementPage />,
      // },
      
      {
        path: "account-settings",
        element: <AccountSettingsPage />,
      },
      
      {
        path: "orders",
        element: <UserOrdersPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
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
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
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

     
    ],
  },

  // Staff route (also no header/footer)
  // {
  //   path: "/staff",
  //   element: (
  //     <PrivateRoute>
  //       <StaffOrdersPage />
  //     </PrivateRoute>
  //   ),
  // },
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
