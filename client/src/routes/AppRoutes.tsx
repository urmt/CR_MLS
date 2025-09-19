import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import PropertySearchPage from '../pages/PropertySearchPage'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import PropertyDetailPage from '../pages/PropertyDetailPage'
import Layout from '../layouts/Layout'
import ProtectedRoute from './ProtectedRoute'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<PropertySearchPage />} />
        <Route path="property/:id" element={<PropertyDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes
