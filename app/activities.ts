export interface Activity {
    title: string;
    subtitle: string;
    pointValue: number;
    imagePath: string;
  }
  
  export const activities: Activity[] = [
    { title: "Sadaqah", subtitle: "Charity", pointValue: 100, imagePath: "@/assets/images/sadaqah.png" },
    { title: "Quran Memorization", subtitle: "Memorizing The Quran", pointValue: 300, imagePath: "@/assets/images/quran.png" },
    { title: "Reading Quran", subtitle: "Reading The Quran", pointValue: 200, imagePath: "@/assets/images/quran.png" },
    { title: "RCM Service/Volunteer", subtitle: "Input What You Did", pointValue: 200, imagePath: "@/assets/images/rcm.png" },
    { title: "Attending Taraweh", subtitle: "Praying Taraweh", pointValue: 100, imagePath: "@/assets/images/taraweeh.png" },
    { title: "Cooking Iftar For Your Family", subtitle: "Preparing Iftar", pointValue: 100, imagePath: "@/assets/images/rcm.png" },
    { title: "Dhikr", subtitle: "Remembrance Of Allah", pointValue: 150, imagePath: "@/assets/images/rcm.png" },
    { title: "Breaking Your Fast With Dates And Water", subtitle: "Breaking Fast", pointValue: 150, imagePath: "@/assets/images/rcm.png" },
    { title: "Intention For Fasting", subtitle: "Setting The Intention", pointValue: 150, imagePath: "@/assets/images/rcm.png" },
    { title: "Making Dua Before Iftar", subtitle: "Praying Before Iftar", pointValue: 150, imagePath: "@/assets/images/rcm.png" },
  ];
  