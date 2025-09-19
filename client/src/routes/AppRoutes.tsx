import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import PropertySearchPage from '../pages/PropertySearchPage'
import PropertyDetailPage from '../pages/PropertyDetailPage'
import CreatePropertyPage from '../pages/CreatePropertyPage'
import Layout from '../layouts/Layout'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<PropertySearchPage />} />
        <Route path="property/:id" element={<PropertyDetailPage />} />
        <Route path="create" element={<CreatePropertyPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
