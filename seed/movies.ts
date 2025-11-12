import {Movie, Actor, MovieCast, Award} from '../shared/types'


export const movies : Movie[] = [
  {
    pk: "m1000",
    sk: "xxxx",
    title: "The Shawshank Redemption",
    releaseDate: "1994-09-22",
    overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
  },
  {
    pk: "m1001",
    sk: "xxxx",
    title: "The Godfather",
    releaseDate: "1972-03-24",
    overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."
  },
  {
    pk: "m1002",
    sk: "xxxx",
    title: "The Dark Knight",
    releaseDate: "2008-07-18",
    overview: "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham. The Dark Knight must accept one of the greatest psychological and physical tests of his ability to fight injustice."
  }
];

export const actors : Actor[] = [
  {
    pk: "a2000",
    sk: "xxxx",
    name: "Morgan Freeman",
    bio: "An American actor, director, and narrator known for his distinctive deep voice.",
    birthDate: "1937-06-01"
  },
  {
    pk: "a2001",
    sk: "xxxx",
    name: "Tim Robbins",
    bio: "An American actor, screenwriter, director, producer, and musician.",
    birthDate: "1958-10-16"
  },
  {
    pk: "a2100",
    sk: "xxxx",
    name: "Marlon Brando",
    bio: "An American actor and film director who is widely regarded as one of the greatest and most influential actors of all time.",
    birthDate: "1924-04-03"
  },
  {
    pk: "a2101",
    sk: "xxxx",
    name: "Al Pacino",
    bio: "An American actor and filmmaker known for his intense and charismatic performances.",
    birthDate: "1940-04-25"
  },
  {
    pk: "a2102",
    sk: "xxxx",
    name: "James Caan",
    bio: "An American actor known for his roles in classic films.",
    birthDate: "1940-03-26"
  },
  {
    pk: "a2200",
    sk: "xxxx",
    name: "Christian Bale",
    bio: "An English actor known for his versatility and intense method acting.",
    birthDate: "1974-01-30"
  },
  {
    pk: "a2201",
    sk: "xxxx",
    name: "Heath Ledger",
    bio: "An Australian actor and music video director known for his diverse roles.",
    birthDate: "1979-04-04"
  },
];

export const movieCasts: MovieCast[] = [
  {
      pk: "c1000",
      sk: "2000",
      actorName: "Morgan Freeman",
      roleName: "Ellis Boyd 'Red' Redding",
      roleDescription: "A long-term inmate who becomes the best friend of Andy Dufresne.",
    },
    {
      pk: "c1000",
      sk: "2001",
      actorName: "Tim Robbins",
      roleName: "Andy Dufresne",
      roleDescription: "A banker who is sentenced to life in Shawshank State Penitentiary for the murder of his wife and her lover.",
    },
    {
      pk: "c1001",
      sk: "2100",
      actorName: "Marlon Brando",
      roleName: "Vito Corleone",
      roleDescription: "The aging patriarch of the Corleone crime family.",
    },
    {
      pk: "c1001",
      sk: "2101",
      actorName: "Al Pacino",
      roleName: "Michael Corleone",
      roleDescription: "The youngest son of Vito Corleone, who becomes the new Godfather."
    },
    {
      pk: "c1001",
      sk: "2102",
      actorName: "James Caan",
      roleName: "Sonny Corleone",
      roleDescription: "The hot-headed eldest son of Vito Corleone."
    },
    {
      pk: "c1002",
      sk: "2200",
      actorName: "Christian Bale",
      roleName: "Bruce Wayne / Batman",
      roleDescription: "A billionaire who fights crime as the masked vigilante Batman.",
    },
    {
      pk: "c1002",
      sk: "2201",
      actorName: "Heath Ledger",
      roleName: "Joker",
      roleDescription: "The arch-nemesis of Batman, known for his chaotic and sadistic nature.",
    },
];

export const awards: Award[] = [
  {
    pk: "w1000",
    sk: "Academy",
    category: "Best Picture",
    year: 1995
  },
  {
    pk: "w1000",
    sk: "CFCA",
    category: "Best Picture",
    year: 1995
  },
  {
    pk: "w1001",
    sk: "Academy",
    category: "Best Picture",
    year: 1973
  },
  {
    pk: "w1001",
    sk: "Golden Globe",
    category: "Best Motion Picture – Drama",
    year: 1973
  },
  {
    pk: "w2100",
    sk: "Golden Globe",
    category: "Best Actor in a Motion Picture – Drama",
    year: 1973
  },
  {
    pk: "w2102",
    sk: "Academy",
    category: "Best Supporting Actor",
    year: 1973
  },
  {
    pk: "w2201",
    sk: "BAFTA",
    category: "Best Supporting Actor",
    year: 2009
  },
  {
    pk: "w2201",
    sk: "Academy",
    category: "Best Supporting Actor",
    year: 2009
  }
];
