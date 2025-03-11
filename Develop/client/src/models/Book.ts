export interface Book {
  bookId: string;
  title: string;
  authors?: string[]; 
  description?: string;
  image?: string; 
  link?: string;  
}