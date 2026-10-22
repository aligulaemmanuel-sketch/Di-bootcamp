export const STORY_GENRES = [
  "Fantasy",
  "Sci-Fi",
  "Mystery",
  "Romance",
  "Adventure",
  "Thriller",
  "Horror",
  "Historical",
  "Poetry",
  "Young Adult",
  "Children",
  "Non-fiction",
  "General",
] as const;

export const GENRE_ART: Record<string, string> = {
  Fantasy: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=85",
  "Sci-Fi": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=85",
  Mystery: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85",
  Romance: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85",
  Adventure: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85",
  Thriller: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=85",
  Horror: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=900&q=85",
  Historical: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
  Poetry: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85",
  "Young Adult": "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=85",
  Children: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&w=900&q=85",
  "Non-fiction": "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
  General: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85",
};

export const FEATURED_STORIES = [
  {
    genre: "Fantasy",
    title: "The cartographer of lost things",
    excerpt: "Every map in Elian's shop led somewhere the world had forgotten.",
    byline: "A story starter",
  },
  {
    genre: "Mystery",
    title: "Room for one more",
    excerpt: "The guestbook listed twelve names. The house had only eleven rooms.",
    byline: "A story starter",
  },
  {
    genre: "Sci-Fi",
    title: "A message from tomorrow",
    excerpt: "At 8:03 each morning, the old radio whispered a date that hadn't arrived.",
    byline: "A story starter",
  },
  {
    genre: "Romance",
    title: "Postcards from the almost",
    excerpt: "They'd been writing to each other for years, just never in the same timeline.",
    byline: "A story starter",
  },
] as const;
