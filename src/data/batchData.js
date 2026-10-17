/**
 * FACULTY OF ENGINEERING - UNIVERSITY OF PERADENIYA (UOP)
 * BATCH E/23 PORTAL CONFIGURATION
 * 
 * Started: October 10, 2024
 * Milestone: 4 Semesters Completed (2024 - 2028)
 * Domain: @eng.pdn.ac.lk
 */

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

// Helper default user avatar generator using initials
export const getDefaultAvatar = (name = 'E23') => 
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'E23')}&backgroundColor=0f172a,1e293b,334155&textColor=f59e0b,38bdf8,fb7185&radius=50`;



/**
 * The official E/23 Batch Member Roster
 */
export const initialBatchmates = [
  // --- MEMBERS FROM OFFICIAL BIRTHDAY REGISTER (25 MEMBERS) ---
  {
    id: "e23020",
    regNo: "E/23/020",
    universityEmail: "e23020@eng.pdn.ac.lk",
    personalEmail: "peradeniyaguys@gmail.com",
    name: "G. Arunothayan",
    nickname: "Arun",
    birthday: "2004-01-14",
    photo: getDefaultAvatar("G. Arunothayan"),
    role: "Batch Representative / Web Lead",
    department: "Engineering Faculty",
    quote: "Building the official E/23 portal. 4 semesters down at Pera Eng, 4 more to go!",
    detailsPending: false,
    social: { instagram: "arunothayan_g", linkedin: "arunothayan", phone: "+94 77 123 4567" }
  },
  {
    id: "e23010",
    regNo: "E/23/010",
    universityEmail: "e23010@eng.pdn.ac.lk",
    name: "S. Aksaraan",
    nickname: "Aksa",
    birthday: "2005-01-25",
    photo: getDefaultAvatar("S. Aksaraan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Surviving mid-semester exams since October 2024.",
    detailsPending: false,
    social: { instagram: "aksaraan_s" }
  },
  {
    id: "e23040",
    regNo: "E/23/040",
    universityEmail: "e23040@eng.pdn.ac.lk",
    name: "V. Birunthan",
    nickname: "Birunth",
    birthday: "2004-10-12",
    photo: getDefaultAvatar("V. Birunthan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Always ready for the Hantana hike and Hanthana sunsets.",
    detailsPending: false,
    social: { instagram: "birunthan_v" }
  },
  {
    id: "e23049",
    regNo: "E/23/049",
    universityEmail: "e23049@eng.pdn.ac.lk",
    name: "S. Chelvagajan",
    nickname: "Chelva",
    birthday: "2003-11-28",
    photo: getDefaultAvatar("S. Chelvagajan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Halfway through Pera engineering!",
    detailsPending: false,
    social: { instagram: "chelvagajan_s" }
  },
  {
    id: "e23078",
    regNo: "E/23/078",
    universityEmail: "e23078@eng.pdn.ac.lk",
    name: "J. Dinushan",
    nickname: "Dinu",
    birthday: "2004-03-16",
    photo: getDefaultAvatar("J. Dinushan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Never miss an Akbar hall or Marcus hall gathering.",
    detailsPending: false,
    social: { instagram: "dinushan_j" }
  },
  {
    id: "e23140",
    regNo: "E/23/140",
    universityEmail: "e23140@eng.pdn.ac.lk",
    name: "A. Janushan",
    nickname: "Janu",
    birthday: "2004-07-31",
    photo: getDefaultAvatar("A. Janushan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Engineering mathematics tests were tough, but our batch bond is tougher.",
    detailsPending: false,
    social: { instagram: "janushan_a" }
  },
  {
    id: "e23163",
    regNo: "E/23/163",
    universityEmail: "e23163@eng.pdn.ac.lk",
    name: "S. Kaneshavel",
    nickname: "Kanesh",
    birthday: "2003-03-21",
    photo: getDefaultAvatar("S. Kaneshavel"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Peradeniya campus vibes are truly magical.",
    detailsPending: false,
    social: { instagram: "kaneshavel_s" }
  },
  {
    id: "e23223",
    regNo: "E/23/223",
    universityEmail: "e23223@eng.pdn.ac.lk",
    name: "N. Matheeshan",
    nickname: "Mathee",
    birthday: "2004-10-10",
    photo: getDefaultAvatar("N. Matheeshan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "From day 1 on October 10, 2024 to Semester 4 milestone!",
    detailsPending: false,
    social: { instagram: "matheesan_n" }
  },
  {
    id: "e23245",
    regNo: "E/23/245",
    universityEmail: "e23245@eng.pdn.ac.lk",
    name: "B. Nilaxshan",
    nickname: "Nilax",
    birthday: "2004-09-20",
    photo: getDefaultAvatar("B. Nilaxshan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Coding labs and CAD drawings conquered.",
    detailsPending: false,
    social: { instagram: "nilaxshan_b" }
  },
  {
    id: "e23272",
    regNo: "E/23/272",
    universityEmail: "e23272@eng.pdn.ac.lk",
    name: "V. Piramilan",
    nickname: "Pirami",
    birthday: "2002-07-22",
    photo: getDefaultAvatar("V. Piramilan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Looking forward to our next 4 semesters!",
    detailsPending: false,
    social: { instagram: "piramilan_v" }
  },
  {
    id: "e23322",
    regNo: "E/23/322",
    universityEmail: "e23322@eng.pdn.ac.lk",
    name: "S. Ropikan",
    nickname: "Ropi",
    birthday: "2004-09-18",
    photo: getDefaultAvatar("S. Ropikan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Engineering drawing sheets on the drafting boards till midnight.",
    detailsPending: false,
    social: { instagram: "ropikan_s" }
  },
  {
    id: "e23325",
    regNo: "E/23/325",
    universityEmail: "e23325@eng.pdn.ac.lk",
    name: "K. Rukshikan",
    nickname: "Rukshi",
    birthday: "2004-07-25",
    photo: getDefaultAvatar("K. Rukshikan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Pera rain and umbrella sharing with batchmates.",
    detailsPending: false,
    social: { instagram: "rukshikan_k" }
  },
  {
    id: "e23353",
    regNo: "E/23/353",
    universityEmail: "e23353@eng.pdn.ac.lk",
    name: "R. Sarvesh",
    nickname: "Sarvi",
    birthday: "2004-10-27",
    photo: getDefaultAvatar("R. Sarvesh"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Grateful for the E/23 brotherhood.",
    detailsPending: false,
    social: { instagram: "sarvesh_r" }
  },
  {
    id: "e23375",
    regNo: "E/23/375",
    universityEmail: "e23375@eng.pdn.ac.lk",
    name: "V. Shanthoosh",
    nickname: "Shanthosh",
    birthday: "2004-08-06",
    photo: getDefaultAvatar("V. Shanthoosh"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Peradeniya engineers make an impact everywhere.",
    detailsPending: false,
    social: { instagram: "shanthoosh_v" }
  },
  {
    id: "e23377",
    regNo: "E/23/377",
    universityEmail: "e23377@eng.pdn.ac.lk",
    name: "T. Shiriram",
    nickname: "Shiri",
    birthday: "2004-03-05",
    photo: getDefaultAvatar("T. Shiriram"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "October 10 anniversary memories! E/23 rocks.",
    detailsPending: false,
    social: { instagram: "shiriram_t" }
  },
  {
    id: "e23393",
    regNo: "E/23/393",
    universityEmail: "e23393@eng.pdn.ac.lk",
    name: "J. Thanushananth",
    nickname: "Thanushan",
    birthday: "2004-10-15",
    photo: getDefaultAvatar("J. Thanushananth"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Cheers to 4 semesters done together!",
    detailsPending: false,
    social: { instagram: "thanushananth_j" }
  },
  {
    id: "e23409",
    regNo: "E/23/409",
    universityEmail: "e23409@eng.pdn.ac.lk",
    name: "M. Vabishan",
    nickname: "Vabi",
    birthday: "2004-09-06",
    photo: getDefaultAvatar("M. Vabishan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Two years done at Faculty of Engineering, University of Peradeniya.",
    detailsPending: false,
    social: { instagram: "vabieshan" }
  },
  {
    id: "e23019",
    regNo: "E/23/019",
    universityEmail: "e23019@eng.pdn.ac.lk",
    name: "A. Agalya",
    nickname: "Agalya",
    birthday: "2005-01-02",
    photo: getDefaultAvatar("A. Agalya"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: {}
  },
  {
    id: "e23157",
    regNo: "E/23/157",
    universityEmail: "e23157@eng.pdn.ac.lk",
    name: "J. Sivapriya",
    nickname: "Sivapriya",
    birthday: "2004-12-20",
    photo: getDefaultAvatar("J. Sivapriya"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: {}
  },
  {
    id: "e23162",
    regNo: "E/23/162",
    universityEmail: "e23162@eng.pdn.ac.lk",
    name: "K. Hetharani",
    nickname: "Hetha",
    birthday: "2004-06-20",
    photo: getDefaultAvatar("K. Hetharani"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: {}
  },
  {
    id: "e23172",
    regNo: "E/23/172",
    universityEmail: "e23172@eng.pdn.ac.lk",
    name: "L. Kasthuri",
    nickname: "Kasthu",
    birthday: "2004-12-27",
    photo: getDefaultAvatar("L. Kasthuri"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: {}
  },
  {
    id: "e23221",
    regNo: "E/23/221",
    universityEmail: "e23221@eng.pdn.ac.lk",
    name: "M. Bathusha",
    nickname: "Bathu",
    birthday: "2003-11-20",
    photo: getDefaultAvatar("M. Bathusha"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: {}
  },
  {
    id: "e23231",
    regNo: "E/23/231",
    universityEmail: "e23231@eng.pdn.ac.lk",
    name: "M. Vaishnavi",
    nickname: "Vaish",
    birthday: "2004-07-17",
    photo: getDefaultAvatar("M. Vaishnavi"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: {}
  },
  {
    id: "e23355",
    regNo: "E/23/355",
    universityEmail: "e23355@eng.pdn.ac.lk",
    name: "S. Dilukshika",
    nickname: "Dilu",
    birthday: "2004-10-11",
    photo: getDefaultAvatar("S. Dilukshika"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: {}
  },
  {
    id: "e23378",
    regNo: "E/23/378",
    universityEmail: "e23378@eng.pdn.ac.lk",
    name: "S. Tharshika",
    nickname: "Tharshika",
    birthday: "2004-02-17",
    photo: getDefaultAvatar("S. Tharshika"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: {}
  },
  {
    id: "e23396",
    regNo: "E/23/396",
    universityEmail: "e23396@eng.pdn.ac.lk",
    name: "M. Tharsika",
    nickname: "Tharsika",
    birthday: "2004-08-21",
    photo: getDefaultAvatar("M. Tharsika"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: {}
  },
  {
    id: "e23401",
    regNo: "E/23/401",
    universityEmail: "e23401@eng.pdn.ac.lk",
    name: "T. Priyanthi",
    nickname: "Priyanthi",
    birthday: "2004-10-20",
    photo: getDefaultAvatar("T. Priyanthi"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: {}
  },
  {
    id: "e23_vanoja",
    regNo: "E/23/Vanoja",
    universityEmail: "e23vanoja@eng.pdn.ac.lk",
    name: "S. Vanoja",
    nickname: "Vanoja",
    birthday: "2004-09-06",
    photo: getDefaultAvatar("S. Vanoja"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: true,
    social: {}
  },

  // --- OTHER E/23 MEMBERS (DETAILS PENDING FIRST LOGIN) ---
  {
    id: "e23009",
    regNo: "E/23/009",
    universityEmail: "e23009@eng.pdn.ac.lk",
    name: "Y. Akalyan",
    nickname: "Akal",
    birthday: "2004-02-28",
    photo: getDefaultAvatar("Y. Akalyan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: { instagram: "akalyan_y", linkedin: "akalyan" }
  },
  {
    id: "e23110",
    regNo: "E/23/110",
    universityEmail: "e23110@eng.pdn.ac.lk",
    name: "V. Geethavarshan",
    nickname: "Geetha",
    birthday: "2004-07-31",
    photo: getDefaultAvatar("V. Geethavarshan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: { instagram: "geethavarshan" }
  },
  {
    id: "e23139",
    regNo: "E/23/139",
    universityEmail: "e23139@eng.pdn.ac.lk",
    name: "Y. Ithayan",
    nickname: "Ithu",
    birthday: "2004-05-19",
    photo: getDefaultAvatar("Y. Ithayan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: { instagram: "ithayan_y" }
  },
  {
    id: "e23256",
    regNo: "E/23/256",
    universityEmail: "e23256@eng.pdn.ac.lk",
    name: "S. Paveenan",
    nickname: "Paveen",
    birthday: "",
    photo: getDefaultAvatar("S. Paveenan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: true,
    social: { instagram: "paveenan_s" }
  },
  {
    id: "e23273",
    regNo: "E/23/273",
    universityEmail: "e23273@eng.pdn.ac.lk",
    name: "A. Piraveen",
    nickname: "Pira",
    birthday: "2004-02-16",
    photo: getDefaultAvatar("A. Piraveen"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: { instagram: "piraveen" }
  },
  {
    id: "e23276",
    regNo: "E/23/276",
    universityEmail: "e23276@eng.pdn.ac.lk",
    name: "L. Pradoosh",
    nickname: "Pradoo",
    birthday: "",
    photo: getDefaultAvatar("L. Pradoosh"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: true,
    social: { instagram: "pradoosh_l" }
  },
  {
    id: "e23321",
    regNo: "E/23/321",
    universityEmail: "e23321@eng.pdn.ac.lk",
    name: "R. Rohan",
    nickname: "Rohan",
    birthday: "2004-11-04",
    photo: getDefaultAvatar("R. Rohan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: { instagram: "rohan_r" }
  },
  {
    id: "e23332",
    regNo: "E/23/332",
    universityEmail: "e23332@eng.pdn.ac.lk",
    name: "M. Sajinath",
    nickname: "Saji",
    birthday: "",
    photo: getDefaultAvatar("M. Sajinath"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: true,
    social: { instagram: "sajinath_m" }
  },
  {
    id: "e23350",
    regNo: "E/23/350",
    universityEmail: "e23350@eng.pdn.ac.lk",
    name: "S. Sangeerth",
    nickname: "Sangee",
    birthday: "2004-05-16",
    photo: getDefaultAvatar("S. Sangeerth"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: { instagram: "sangeerth" }
  },
  {
    id: "e23357",
    regNo: "E/23/357",
    universityEmail: "e23357@eng.pdn.ac.lk",
    name: "Sathushan",
    nickname: "Sathu",
    birthday: "",
    photo: getDefaultAvatar("Sathushan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: true,
    social: { instagram: "sathushan" }
  },
  {
    id: "e23387",
    regNo: "E/23/387",
    universityEmail: "e23387@eng.pdn.ac.lk",
    name: "K. Srikaran",
    nickname: "Sri",
    birthday: "2004-11-08",
    photo: getDefaultAvatar("K. Srikaran"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: { instagram: "srikaran" }
  },
  {
    id: "e23388",
    regNo: "E/23/388",
    universityEmail: "e23388@eng.pdn.ac.lk",
    name: "Stalan Raj",
    nickname: "Stalan",
    birthday: "2004-09-23",
    photo: getDefaultAvatar("Stalan Raj"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: { instagram: "stalanraj" }
  },
  {
    id: "e23391",
    regNo: "E/23/391",
    universityEmail: "e23391@eng.pdn.ac.lk",
    name: "R. Thamilnilavan",
    nickname: "Thamil",
    birthday: "2004-12-08",
    photo: getDefaultAvatar("R. Thamilnilavan"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: { instagram: "thamilnilavan_r" }
  },
  {
    id: "e23392",
    regNo: "E/23/392",
    universityEmail: "e23392@eng.pdn.ac.lk",
    name: "V. Thanush",
    nickname: "Thanush",
    birthday: "2004-09-17",
    photo: getDefaultAvatar("V. Thanush"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: { instagram: "thanush_v" }
  },
  {
    id: "e23415",
    regNo: "E/23/415",
    universityEmail: "e23415@eng.pdn.ac.lk",
    name: "T. Vishal",
    nickname: "Vishi",
    birthday: "2004-12-23",
    photo: getDefaultAvatar("T. Vishal"),
    role: "E/23 Engineer",
    department: "Engineering Faculty",
    quote: "Details not included yet — will be updated upon first login.",
    detailsPending: false,
    social: { instagram: "vishal" }
  }
];

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
    title: "Year 2: Batch Trip & Tour 🚌",
    year: "Year 2",
    category: "Year 2",
    type: "Trips",
    folderId: "1CKgVmJxfKBbWPw8al94kUL1pU-4HI_HL",
    driveFolderUrl: "https://drive.google.com/drive/folders/1CKgVmJxfKBbWPw8al94kUL1pU-4HI_HL?usp=drive_link",
    description: "Second year batch tour, industrial excursion, exploring new destinations, and bus karaoke.",
    itemCount: "Google Drive Folder",
    coverImage: "https://drive.google.com/file/d/1uOPGE9xa2IL00TVdqgawC1maWUGQ5yBW/view?usp=sharing",
    restricted: true,
    samplePhotos: [
      {
        url: "https://drive.google.com/file/d/12KTrTe5u7j5tAhkJ2Q7Dp2tsa51n0eKu/view?usp=sharing",
        caption: "Year 2 tour bus karaoke and trip highlights."
      },
      {
        url: "https://drive.google.com/file/d/13A74p4XJJPZixizFovrtCNXTjIJmE3XO/view?usp=sharing",
        caption: "Scenic sunset stop during Year 2 tour."
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
