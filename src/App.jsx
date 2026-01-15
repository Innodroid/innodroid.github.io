import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CareersPage from './pages/CareersPage';
import TestimonialsPage from './pages/TestimonialsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="/eb/privacy-policy" element={<PrivacyPolicyPage appName="Chatterbird" />} />
                <Route path="/mcc/privacy-policy" element={<PrivacyPolicyPage appName="Memory Care Clock" />} />
            </Routes>
        </Layout>
    );
}

export default App;
