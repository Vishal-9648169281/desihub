import { Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AdminLayout from '@/layouts/AdminLayout'
import { RequireAuth, RequireContentStaff, RequireSuperAdmin } from '@/components/ProtectedRoute'

import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Search from '@/pages/Search'
import Trending from '@/pages/Trending'
import Latest from '@/pages/Latest'
import Categories from '@/pages/Categories'
import CategoryPage from '@/pages/CategoryPage'
import MyList from '@/pages/MyList'
import History from '@/pages/History'
import Profile from '@/pages/Profile'
import Watch from '@/pages/Watch'
import NotFound from '@/pages/NotFound'

import AdminDashboard from '@/pages/admin/Dashboard'
import AdminVideos from '@/pages/admin/Videos'
import AdminUpload from '@/pages/admin/Upload'
import AdminCategories from '@/pages/admin/Categories'
import AdminUsers from '@/pages/admin/Users'
import AdminTeam from '@/pages/admin/Team'
import AdminAnalytics from '@/pages/admin/Analytics'
import AdminSearchAnalytics from '@/pages/admin/SearchAnalytics'
import AdminSettings from '@/pages/admin/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/latest" element={<Latest />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/watch/:slug" element={<Watch />} />
        <Route
          path="/my-list"
          element={
            <RequireAuth>
              <MyList />
            </RequireAuth>
          }
        />
        <Route
          path="/history"
          element={
            <RequireAuth>
              <History />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin-dashboard"
        element={
          <RequireContentStaff>
            <AdminLayout />
          </RequireContentStaff>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="videos" element={<AdminVideos />} />
        <Route path="videos/upload" element={<AdminUpload />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route
          path="users"
          element={
            <RequireSuperAdmin>
              <AdminUsers />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="team"
          element={
            <RequireSuperAdmin>
              <AdminTeam />
            </RequireSuperAdmin>
          }
        />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="search-analytics" element={<AdminSearchAnalytics />} />
        <Route
          path="settings"
          element={
            <RequireSuperAdmin>
              <AdminSettings />
            </RequireSuperAdmin>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
