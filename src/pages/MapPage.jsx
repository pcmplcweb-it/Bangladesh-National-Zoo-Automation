import { useSearchParams } from 'react-router-dom';
import ZooMap from '../components/ZooMap';

export function MapPage() {
  const [params] = useSearchParams();
  return <ZooMap height="calc(100vh - var(--header-h) - var(--topbar-h))" initialZone={params.get('zone')} />;
}

export function TourPage() {
  return <ZooMap height="calc(100vh - var(--header-h) - var(--topbar-h))" autoTour showIntroHint={false} />;
}
