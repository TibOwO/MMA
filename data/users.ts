// data/users.ts

export type User = {
  id: number;
  nom: string;
  prenom: string;
  login: string;
  email: string;
  password: string; // hashé en production, ici simulé en clair
  role: "admin" | "membre" | "coach";
  sport?: string | string[]; // discipline clé (ex: 'judo', 'boxe', 'mma') ou tableau pour multi-sports
};

export const users: User[] = [
  {
    id: 1,
    nom: "Admin",
    prenom: "Super",
    login: "superadmin",
    email: "admin@mmaclub.fr",
    password: "admin1234",
    role: "admin",
  },
  {
    id: 2,
    nom: "Dupont",
    prenom: "Jean",
    login: "jeandupont",
    email: "jean.dupont@email.com",
    password: "jean1234",
    role: "membre",
  },
  // Coachs
  {
    id: 3,
    nom: "Martin",
    prenom: "Luc",
    login: "lucmartin",
    email: "luc.martin@email.com",
    password: "coachluc",
    role: "coach",
    sport: "judo",
  },
  {
    id: 4,
    nom: "Bernard",
    prenom: "Sophie",
    login: "sophiebernard",
    email: "sophie.bernard@email.com",
    password: "coachsophie",
    role: "coach",
    sport: ["judo", "lutalivre"], // Sophie entraîne à la fois en judo et en lutte libre
  },
  {
    id: 5,
    nom: "Dupont",
    prenom: "Alice",
    login: "alicedupont",
    email: "alice.dupont@email.com",
    password: "coachalice",
    role: "coach",
    sport: "boxe", // Alice est coach de boxe uniquement
  },
  {
    id: 6,
    nom: "Martin",
    prenom: "Bob",
    login: "bobmartin",
    email: "bob.martin@email.com",
    password: "coachbob",
    role: "coach",
    sport: "boxe",
  },
  {
    id: 7,
    nom: "Doe",
    prenom: "John",
    login: "johndoe",
    email: "john.doe@email.com",
    password: "coachjohn",
    role: "coach",
    sport: "mma",
  },
  {
    id: 8,
    nom: "Smith",
    prenom: "Jane",
    login: "janesmith",
    email: "jane.smith@email.com",
    password: "coachjane",
    role: "coach",
    sport: "mma",
  },
];
