// src/data/disciplines.ts

export const disciplines = {
  judo: {
    name: "Judo",
    presentation:
      "Le Judo est un art martial japonais axé sur la maîtrise de l'équilibre, les projections et le respect de l'adversaire. Accessible dès 3 ans, le Judo développe coordination, concentration et esprit sportif.",
    coaches: [
      { nom: "Luc Martin", photoUrl: "/images/coaches/luc.jpg" },
      { nom: "Sophie Bernard", photoUrl: "/images/coaches/sophie.jpg" },
    ],
    tarifs: [
      {
        nom: "3 - 5 ans",
        prix: "330€/an",
        horaires: ["Mercredi 11h00 - 12h00"],
        description: "Découverte du mouvement et de l'équilibre pour les tout-petits.",
      },
      {
        nom: "6 - 11 ans",
        prix: "330€/an",
        horaires: ["Lundi 17h30 - 18h30", "Mercredi 10h00 - 11h00"],
        description: "Apprentissage des techniques de base pour les enfants de 6 à 11 ans.",
      },
    ],
    contact: ["07 60 35 00 78"],
  },

  boxe: {
    name: "Boxe",
    presentation:
      "La Boxe permet de développer endurance, puissance et technique. Des cours pour enfants et adultes sont proposés, avec un accent sur le plaisir, la discipline et la sécurité.",
    coaches: [
      { nom: "Alice Dupont", photoUrl: "/images/coaches/alice.jpg" },
      { nom: "Bob Martin", photoUrl: "/images/coaches/bob.jpg" },
    ],
    tarifs: [
      {
        nom: "Boxe Kids 6-9 ans",
        prix: "290€/an",
        horaires: ["Mercredi 14h00 - 15h00", "Samedi 11h00 - 12h00"],
        description: "Introduction à la boxe pour les enfants de 6 à 9 ans.",
      },
      {
        nom: "Boxe Kids 10-13 ans",
        prix: "290€/an",
        horaires: ["Mercredi 15h00 - 16h00", "Samedi 12h00 - 13h00"],
        description: "Pour les enfants de 10 à 13 ans, apprentissage plus avancé.",
      },
      {
        nom: "Adultes",
        prix: "300€/an",
        horaires: ["Lundi 17h30 - 18h30", "Mercredi 19h30 - 21h00", "Vendredi 18h30 - 19h30"],
        description: "Cours de boxe pour adultes tous niveaux.",
      },
    ],
    contact: ["07 83 67 54 75"],
  },

  mma: {
    name: "MMA",
    presentation:
      "Le MMA (Mixed Martial Arts) combine plusieurs arts martiaux pour développer technique, endurance et stratégie. Des cours sont proposés pour enfants, adolescents et adultes, loisir ou compétition.",
    coaches: [
      { nom: "John Doe", photoUrl: "/images/coaches/john.jpg" },
      { nom: "Jane Smith", photoUrl: "/images/coaches/jane.jpg" },
    ],
    tarifs: [
      // MMA enfants
      {
        nom: "MMA Kids 6 ans",
        prix: "330€/an",
        horaires: ["Jeudi 17h30 - 18h30"],
        description: "Initiation au MMA pour les enfants de 6 ans.",
      },
      {
        nom: "MMA Kids 6-11 ans",
        prix: "330€/an",
        horaires: ["Lundi 18h30 - 19h30", "Jeudi 18h30 - 19h30"],
        description: "Cours pour enfants de 6 à 11 ans, découverte des arts martiaux mixtes.",
      },

      // MMA adolescents
      {
        nom: "MMA Ados 12-17 ans (loisir)",
        prix: "330€/an",
        horaires: ["Mardi 18h30 - 19h30", "Jeudi 18h30 - 19h30"],
        description: "Pour adolescents, pratique loisir.",
      },
      {
        nom: "MMA Ados Compétiteurs",
        prix: "350€/an",
        horaires: ["Lundi 19h30 - 20h30", "Mercredi 17h00 - 18h00", "Vendredi 20h00 - 21h00"],
        description: "Réservé aux compétiteurs, sur sélection.",
      },
      {
        nom: "Kick Ados",
        prix: "290€/an",
        horaires: ["Mardi 18h00 - 19h00"],
        description: "Entraînement de kickboxing pour adolescents.",
      },

      // MMA adultes
      {
        nom: "MMA Loisir 2 jours/sem.",
        prix: "450€/an",
        horaires: [
          "Lundi 18h30 - 20h00",
          "Mercredi 18h00 - 19h30",
          "OU",
          "Mardi 19h30 - 21h00",
          "Vendredi 19h30 - 21h00",
        ],
        description: "Pratique loisir pour adultes deux fois par semaine.",
      },
      {
        nom: "MMA Loisir 4 jours/sem.",
        prix: "550€/an",
        horaires: ["Lundi 18h30 - 20h00", "Mardi 19h30 - 21h00", "Mercredi 18h00 - 19h30", "Vendredi 19h30 - 21h00"],
        description: "Pratique loisir pour adultes quatre fois par semaine.",
      },
      {
        nom: "MMA 100% filles",
        prix: "300€/an",
        horaires: ["Mardi 18h00 - 19h00", "Mercredi 18h30 - 19h30", "Samedi 10h30 - 12h00"],
        description: "Cours réservé aux femmes, tous niveaux.",
      },
    ],
    contact: ["06 43 40 76 45", "06 31 01 62 80", "06 14 95 88 49"],
  },

  striking: {
    name: "Striking",
    presentation:
      "Le Striking se concentre sur les techniques de pieds-poings issues du MMA et de la boxe thaï. Cours adaptés pour enfants, adolescents et adultes.",
    coaches: [
      { nom: "Marc Leroy", photoUrl: "/images/coaches/marc.jpg" },
    ],
    tarifs: [
      { nom: "Striking MMA 2J/S", prix: "390€/an", horaires: [], description: "" },
      { nom: "Striking MMA 4J/S", prix: "490€/an", horaires: [], description: "" },
      { nom: "Lady Striking", prix: "390€/an", horaires: [], description: "Cours réservé aux femmes" },
      { nom: "Boxe Thaï", prix: "290€/an", horaires: [], description: "" },
      { nom: "Pieds Poings", prix: "290€/an", horaires: [], description: "" },
      { nom: "Striking Ados", prix: "290€/an", horaires: [], description: "" },
    ],
    contact: ["06 14 95 88 49"],
  },

  lutalivre: {
    name: "Luta Livre",
    presentation:
      "La Luta Livre est un art martial brésilien basé sur la lutte et le grappling. Accessible à tous les niveaux pour adolescents et adultes.",
    coaches: [
      { nom: "Emma Lemoine", photoUrl: "/images/coaches/emma.jpg" },
    ],
    tarifs: [
      {
        nom: "Cours Adultes",
        prix: "300€/an",
        horaires: ["Mardi 19h00 - 20h00", "Mercredi 12h30 - 13h30"],
        description: "Cours technique de Luta Livre pour adultes.",
      },
    ],
    contact: ["06 67 71 68 57"],
  },
};