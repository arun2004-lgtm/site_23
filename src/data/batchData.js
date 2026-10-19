/**
 * FACULTY OF ENGINEERING - UNIVERSITY OF PERADENIYA (UOP)
 * BATCH E/23 PORTAL CONFIGURATION
 * 
 * Started: October 10, 2024
 * Milestone: 4 Semesters Completed (2024 - 2028)
 * Domain: @eng.pdn.ac.lk
 */

import { originalBatchmates, getDefaultAvatar } from './originalBatchData.js';

export { originalBatchmates, getDefaultAvatar };

export const batchInfo = {
  batchName: "E/23 Batch",
  title: "E/23 • Faculty of Engineering, University of Peradeniya",
  motto: "4 Semesters down, 4 to go — Pera Engineers united forever!",
  year: "2024 - 2028",
  startedOn: "October 10, 2024",
  currentMilestone: "Completed 4 Semesters (Halfway Milestone 🎓)",
  institution: "Faculty of Engineering, University of Peradeniya (UoP)",
  universityDomain: "@eng.pdn.ac.lk",
  description: "Official portal for the E/23 Batch of the Faculty of Engineering, University of Peradeniya. Conquered 4 semesters since October 10, 2024 — manage birthdays, share campus stories, and explore our Google Drive photo vault.",
  coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
  stats: {
    semestersDone: "4 / 8",
    progress: "50% Completed",
    batchSize: 43,
    photosArchived: "1,200+",
    startedDate: "Oct 10, 2024",
    yearsTogether: "2 Years"
  }
};

/**
 * Fallback baseline roster (points to original separate archive copy)
 */
export const initialBatchmates = originalBatchmates;

export const photoAlbums = [
  // --- YEAR 1 FOLDERS ---
  {
    id: "y1-trip-1",
    title: "Year 1: Batch Trip 1.0 🎒",
    year: "Year 1",
    category: "Year 1",
    type: "Trips",
    folderId: "1QTkgBzCixevmWM4oHfzv2QTxA7O-g1R3",
    driveFolderUrl: "https://drive.google.com/drive/folders/1QTkgBzCixevmWM4oHfzv2QTxA7O-g1R3?usp=drive_link",
    description: "Year 1 Batch Trip 1.0 — mountain adventures, road trip journey, scenic viewpoints, and unforgettable bonding memories.",
    itemCount: "Google Drive Folder",
    coverImage: "https://drive.google.com/file/d/1cANJTk3GJhoXlr2QZSP8HnscCFfM6FyE/view?usp=sharing",
    restricted: true,
    samplePhotos: [
      {
        url: "https://drive.google.com/file/d/1S1ACEt7DX_ugqI7lETZx2bo6IIKiQofx/view?usp=sharing",
        caption: "Year 1 Batch Trip 1.0 summit viewpoint."
      },
      {
        url: "https://drive.google.com/file/d/1elKCwXubdF69fGs3B9cwAqB_aCD-4K7r/view?usp=sharing",
        caption: "Highway road trip & bus karaoke."
      }
    ]
  },
  {
    id: "y1-trip-2",
    title: "Year 1: Batch Trip 2.0 🎒",
    year: "Year 1",
    category: "Year 1",
    type: "Trips",
    folderId: "1wQAJXI--daLwGb3kiP6ug5fNOR7jWKcv",
    driveFolderUrl: "https://drive.google.com/drive/folders/1wQAJXI--daLwGb3kiP6ug5fNOR7jWKcv?usp=drive_link",
    description: "Year 1 Batch Trip 2.0 — expedition highlights, campfire laughter, bus karaoke, and batch memories.",
    itemCount: "Google Drive Folder",
    coverImage: "https://drive.google.com/file/d/13CBqXBOn5Y_yXlWfMIVnuMAtyok17bIM/view?usp=sharing",
    restricted: true,
    samplePhotos: [
      {
        url: "https://drive.google.com/file/d/1Tj2Chv4Bm5Hpi1-t2046R5159kyqIzDB/view?usp=sharing",
        caption: "Year 1 Batch Trip 2.0 campfire laughter & stories."
      },
      {
        url: "https://drive.google.com/file/d/19Qp2VyOgiDzT_ghZ8KNKiuFAxx7XapIt/view?usp=sharing",
        caption: "Scenic landscapes and batch exploration."
      }
    ]
  },
  {
    id: "y1-birthday",
    title: "Year 1: Birthday Celebrations 🎂",
    year: "Year 1",
    category: "Year 1",
    type: "Birthdays",
    folderId: "1zTG5xGAn8e4RH46Q-B7XemQ6NxlNMCp6",
    driveFolderUrl: "https://drive.google.com/drive/folders/1zTG5xGAn8e4RH46Q-B7XemQ6NxlNMCp6?usp=drive_link",
    description: "All the midnight hostel birthday surprises, cake smashes, and celebration treats from Year 1.",
    itemCount: "Google Drive Folder",
    coverImage: "https://drive.google.com/file/d/17Qw96id922aHkk_z90Z5nHLSLDvkTBXc/view?usp=sharing",
    restricted: true,
    samplePhotos: [
      {
        url: "https://drive.google.com/file/d/1fmJjiFgPt2ZzmAKkTpSej4Aqw0wJxFu-/view?usp=sharing",
        caption: "Year 1 hostel midnight birthday celebrations."
      },
      {
        url: "https://drive.google.com/file/d/1_5Hw2nY0lupm8BE1koej8SM_DCKpO3c_/view?usp=sharing",
        caption: "Party poppers and hostel cake moments."
      }
    ]
  },
  {
    id: "y1-kovil",
    title: "Year 1: Kovil Pooja & Visit 🛕",
    year: "Year 1",
    category: "Year 1",
    type: "Kovil",
    folderId: "1FiVeDdYtU_l42YnGPNIk9mJjSMI-skwn",
    driveFolderUrl: "https://drive.google.com/drive/folders/1FiVeDdYtU_l42YnGPNIk9mJjSMI-skwn?usp=drive_link",
    description: "Year 1 Kovil blessings, cultural gatherings, and traditional celebrations together.",
    itemCount: "Google Drive Folder",
    coverImage: "https://drive.google.com/file/d/1l6mhN1H3BIu5iaX88weC5eVMV6U0RSSg/view?usp=sharing",
    restricted: true,
    samplePhotos: [
      {
        url: "https://drive.google.com/file/d/1GVqD-yDCeq1sICOBHecuirXg5aYvQ1hJ/view?usp=sharing",
        caption: "Year 1 Kovil pooja and batch blessings."
      },
      {
        url: "https://drive.google.com/file/d/1E4484uXeYiyuB54SwtAc4qApO7uKeKsg/view?usp=sharing",
        caption: "Traditional attire & temple gathering."
      }
    ]
  },
  {
    id: "y1-random",
    title: "Year 1: Random Campus Moments 📸",
    year: "Year 1",
    category: "Year 1",
    type: "Random",
    folderId: "1bV0RCQNd5wayFmPlngVkCBNy82_gIh7J",
    driveFolderUrl: "https://drive.google.com/drive/folders/1bV0RCQNd5wayFmPlngVkCBNy82_gIh7J?usp=drive_link",
    description: "Canteen teas, lecture hall shenanigans, lab selfies, and everyday candid memories from Year 1.",
    itemCount: "Google Drive Folder",
    coverImage: "https://drive.google.com/file/d/1Ql-qAzPaaR-JeSmphlyBjSaH52ypfUS0/view?usp=sharing",
    restricted: true,
    samplePhotos: [
      {
        url: "https://drive.google.com/file/d/14f88vtDz6TOTu-rEIcecEDN-XPk809Qx/view?usp=sharing",
        caption: "Year 1 candid faculty moments."
      },
      {
        url: "https://drive.google.com/file/d/1fC0idKDqNN9FhWC3SF_EQgygwDwd2ckd/view?usp=sharing",
        caption: "Lecture hall discussions & laughters."
      }
    ]
  },

  // --- YEAR 2 FOLDERS ---
  {
    id: "y2-trip",
    title: "Year 2: Batch Trip 3.0 🎒",
    year: "Year 2",
    category: "Year 2",
    type: "Trips",
    folderId: "1DINr6lLjXd2jYDYACZm7OdjbSH-YJ31P",
    driveFolderUrl: "https://drive.google.com/drive/folders/1DINr6lLjXd2jYDYACZm7OdjbSH-YJ31P?usp=drive_link",
    description: "Year 2 Batch Trip 3.0 — exploring new destinations, scenic views, campfire laughter, and bus karaoke.",
    itemCount: "Google Drive Folder",
    coverImage: "https://drive.google.com/file/d/1uOPGE9xa2IL00TVdqgawC1maWUGQ5yBW/view?usp=sharing",
    restricted: false,
    samplePhotos: [
      {
        url: "https://drive.google.com/file/d/12KTrTe5u7j5tAhkJ2Q7Dp2tsa51n0eKu/view?usp=sharing",
        caption: "Year 2 Batch Trip 3.0 highlights."
      },
      {
        url: "https://drive.google.com/file/d/13A74p4XJJPZixizFovrtCNXTjIJmE3XO/view?usp=sharing",
        caption: "Scenic sunset stop during Year 2 Batch Trip 3.0."
      }
    ]
  },
  {
    id: "y2-birthday",
    title: "Year 2: Birthday Celebrations 🥳",
    year: "Year 2",
    category: "Year 2",
    type: "Birthdays",
    folderId: "13QhpHUr7Sz_dix9dWAgHOIOBRox2VoYB",
    driveFolderUrl: "https://drive.google.com/drive/folders/13QhpHUr7Sz_dix9dWAgHOIOBRox2VoYB?usp=drive_link",
    description: "Year 2 birthday celebrations, hostel parties, treats, and birthday wishes for the boys.",
    itemCount: "Google Drive Folder",
    coverImage: "https://drive.google.com/file/d/1zQTFJ-8VJdsRiFFAQ6WQ9O3R5sus2CEr/view?usp=sharing",
    restricted: true,
    samplePhotos: [
      {
        url: "https://drive.google.com/file/d/1vRCgmxdoWtd7d49FzdRt2xiP1fnmML-P/view?usp=sharing",
        caption: "Year 2 birthday cake celebrations."
      },
      {
        url: "https://drive.google.com/file/d/1AlBuXXlc6L9xdeGfe1g61zMKcy9zoQBt/view?usp=sharing",
        caption: "Hostel birthday midnight surprise."
      }
    ]
  },
  {
    id: "y2-kovil",
    title: "Year 2: Kovil Pooja & Gathering 🪔",
    year: "Year 2",
    category: "Year 2",
    type: "Kovil",
    folderId: "1a7Kclfojtkie7yfyFXYkZMjAXDLtTnKl",
    driveFolderUrl: "https://drive.google.com/drive/folders/1a7Kclfojtkie7yfyFXYkZMjAXDLtTnKl?usp=drive_link",
    description: "Kovil pooja, prayers for exams, and divine moments shared by the E/23 batch in Year 2.",
    itemCount: "Google Drive Folder",
    coverImage: "https://drive.google.com/file/d/1Pacw4mkoZb8_tBcvLUEILY3_MDxWEm8V/view?usp=sharing",
    restricted: true,
    samplePhotos: [
      {
        url: "https://drive.google.com/file/d/1Wd8vGZbi23N3N1NS1C0fWNhIoBHc0TU6/view?usp=sharing",
        caption: "Year 2 Kovil pooja and gathering."
      },
      {
        url: "https://drive.google.com/file/d/1y9IVf7lMmljDgLA3r0uY2atY5o06gmCz/view?usp=sharing",
        caption: "Kovil prayers for engineering semester exams."
      }
    ]
  },
  {
    id: "y2-matches",
    title: "Year 2: Sports Matches & Cricket 🏏",
    year: "Year 2",
    category: "Year 2",
    type: "Matches",
    folderId: "1iVfIE4AltlsSoOpySR5Yy9bruPm7mRlH",
    driveFolderUrl: "https://drive.google.com/drive/folders/1iVfIE4AltlsSoOpySR5Yy9bruPm7mRlH?usp=drive_link",
    description: "Inter-batch cricket tournaments, football games, intense finishes, and championship cheering.",
    itemCount: "Google Drive Folder",
    coverImage: "https://drive.google.com/file/d/17lQ5lXSxf2NlFcmeGW1UpU-RW-yV3pLP/view?usp=sharing",
    restricted: true,
    samplePhotos: [
      {
        url: "https://drive.google.com/file/d/1r0Ntyb0lZ5YeiC-lUdeGqwxxthS9AmeD/view?usp=sharing",
        caption: "Match day cheering and cricket action."
      },
      {
        url: "https://drive.google.com/file/d/1z6vWSiSnzzoSAmXhHs5n8Sogz0LI38iS/view?usp=sharing",
        caption: "Winning wicket celebration on the university grounds."
      }
    ]
  },
  {
    id: "y2-random",
    title: "Year 2: Random & Canteen Vibes ☕",
    year: "Year 2",
    category: "Year 2",
    type: "Random",
    folderId: "1XniK-i8qAPcyW9KfF_RavJxCPLSjZ1Re",
    driveFolderUrl: "https://drive.google.com/drive/folders/1XniK-i8qAPcyW9KfF_RavJxCPLSjZ1Re?usp=drive_link",
    description: "Canteen chai sessions, drawing board marathons, viva reactions, and daily brotherhood vibes.",
    itemCount: "Google Drive Folder",
    coverImage: "https://drive.google.com/file/d/1xPbDbjH5NtJR6zWJZdbS5Hr4YzbIQosL/view?usp=sharing",
    restricted: true,
    samplePhotos: [
      {
        url: "https://drive.google.com/file/d/1B5vhqIVWTYRTV1rW48YSiz0IktWqES7i/view?usp=sharing",
        caption: "Canteen hangouts and campus laughter."
      },
      {
        url: "https://drive.google.com/file/d/1MpGlNM9EC2dID_lB347LM9RF5cQGgIBx/view?usp=sharing",
        caption: "Drawing boards & late night lab prep."
      }
    ]
  }
];
