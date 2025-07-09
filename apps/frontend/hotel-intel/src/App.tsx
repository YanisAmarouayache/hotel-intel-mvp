import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { client } from './lib/apollo';
import { AppLayout } from './components/Layout';
import { theme } from './constants/theme';
import DashboardPage from './pages/DashboardPage';
import HotelsPage from './pages/HotelsPage';
import AddCompetitorPage from './pages/AddCompetitorPage';
import AddMyHotelPage from './pages/AddMyHotelPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import AnalyseConcurrentiellePage from "./pages/AnalyseConcurrentiellePage";

// Pages temporaires pour les routes non implémentées
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2>{title}</h2>
    <p>Page en cours de développement...</p>
  </div>
);

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router basename="/hotel-intel-mvp">
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/my-hotels" element={<HotelsPage />} />
              <Route path="/add-competitor" element={<AddCompetitorPage />} />
              <Route path="/add-my-hotel" element={<AddMyHotelPage />} />
              <Route path="/hotel/:id" element={<HotelDetailsPage />} />
              <Route
                path="/competitor-analysis"
                element={<AnalyseConcurrentiellePage />}
              />
              <Route
                path="/price-evolution"
                element={<PlaceholderPage title="Évolution des Prix" />}
              />
              <Route
                path="/yield-strategy"
                element={<PlaceholderPage title="Stratégie de Yield" />}
              />
              <Route
                path="/events"
                element={<PlaceholderPage title="Événements" />}
              />
              <Route
                path="/criteria-weights"
                element={<PlaceholderPage title="Critères & Saisons" />}
              />
              <Route
                path="/settings"
                element={<PlaceholderPage title="Paramètres" />}
              />
            </Routes>
          </AppLayout>
        </Router>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
