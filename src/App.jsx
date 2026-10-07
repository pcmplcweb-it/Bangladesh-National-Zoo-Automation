import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { MapPage, TourPage } from './pages/MapPage';
import Animals from './pages/Animals';
import Visit from './pages/Visit';
import { Facilities, About, Contact, NotFound } from './pages/InfoPages';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="map" element={<MapPage />} />
        <Route path="tour" element={<TourPage />} />
        <Route path="animals" element={<Animals />} />
        <Route path="visit" element={<Visit />} />
        <Route path="facilities" element={<Facilities />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
