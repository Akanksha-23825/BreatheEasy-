import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tools from './pages/Tools';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminHeatmap from './pages/AdminHeatmap';
import AdminAlerts from './pages/AdminAlerts';
import AdminRouteMonitor from './pages/AdminRouteMonitor';
import AdminAnalytics from './pages/AdminAnalytics';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* User Routes */}
                <Route path="/" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tools" element={<Tools />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="heatmap" element={<AdminHeatmap />} />
                    <Route path="alerts" element={<AdminAlerts />} />
                    <Route path="routes" element={<AdminRouteMonitor />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}