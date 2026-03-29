// src/data/disciplines.ts
export const disciplines = {
  boxe: {
    name: "boxe",
    presentation: "La boxe est un art de combat qui développe endurance, puissance et technique.",
    coaches: [
      { nom: "Alice Dupont", photoUrl: "/images/coaches/alice.jpg" },
      { nom: "Bob Martin", photoUrl: "/images/coaches/bob.jpg" },
    ],
    tarifs: [
      {
        nom: "Enfants",
        prix: "150€/an",
        horaires: ["Lundi 17h-18h", "Mercredi 17h-18h"],
        description: "Pour les enfants de 8 à 12 ans, niveau débutant/intermédiaire",
      },
      {
        nom: "Adultes",
        prix: "300€/an",
        horaires: ["Lundi 19h-21h", "Jeudi 19h-21h"],
        description: "Pour les adultes de tous niveaux",
      },
    ],
  },
  mma: {
    name: "mma",
    presentation: "Le MMA combine plusieurs arts martiaux pour développer technique, endurance et stratégie.",
    coaches: [
      { nom: "John Doe", photoUrl: "/images/coaches/john.jpg" },
      { nom: "Jane Smith", photoUrl: "/images/coaches/jane.jpg" },
    ],
    tarifs: [
      {
        nom: "Enfants",
        prix: "200€/an",
        horaires: ["Lundi 17h-18h", "Mercredi 17h-18h"],
        description: "Pour les enfants de 8 à 12 ans, niveau débutant/intermédiaire",
      },
      {
        nom: "Adultes",
        prix: "400€/an",
        horaires: ["Lundi 19h-21h", "Jeudi 19h-21h"],
        description: "Pour les adultes de tous niveaux",
      },
    ],
  },
};