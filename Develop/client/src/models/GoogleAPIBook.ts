export interface GoogleAPIVolumeInfo {
  title: string;
  authors?: string[]; // Hacemos opcional porque algunos libros pueden no tener autores
  description?: string;
  imageLinks?: { 
    smallThumbnail?: string;
    thumbnail?: string;
  };
  infoLink?: string; 
}

export interface GoogleAPIBook {
  id: string;
  volumeInfo: GoogleAPIVolumeInfo;
}
