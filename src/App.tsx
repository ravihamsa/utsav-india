import { Link, Route, Routes } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { EmptyState } from './components/UI'
import { usePrivateSeo } from './hooks/useSeo'
import { SignInPage, SignUpPage } from './pages/AuthPages'
import AdminPage from './pages/AdminPage'
import CityPage from './pages/CityPage'
import EventDetailsPage from './pages/EventDetailsPage'
import FavoritesPage from './pages/FavoritesPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import RemindersPage from './pages/RemindersPage'
import SubmitEventPage from './pages/SubmitEventPage'

function NotFoundPage() {
  usePrivateSeo('Page not found', 'This Utsav India page could not be found.')
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="The page you're looking for doesn't exist. Let's get you back to the events."
      action={
        <Link to="/" className="btn-primary">
          Go home
        </Link>
      }
    />
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/city/:city" element={<CityPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/submit" element={<SubmitEventPage />} />
        <Route
          path="/favourites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reminders"
          element={
            <ProtectedRoute>
              <RemindersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}
