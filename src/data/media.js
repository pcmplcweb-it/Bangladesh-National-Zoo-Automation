import { PHOTOS } from './photos';
import { animalById } from './zoo';

// Best real photo for a zone: its own photo, otherwise a photo of an animal living there.
export const zonePhoto = (z) => {
  const key = z.photo || z.animals.map((a) => animalById[a]?.photo).find(Boolean);
  return key ? PHOTOS[key] : null;
};
