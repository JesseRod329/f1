export interface Race {
    round: number;
    name: string;
    officialName: string;
    circuit: string;
    location: string;
    country: string;
    countryCode: string;
    date: string;
    hasSprint: boolean;
    season: number;
}

export const calendar2025: Race[] = [
    { round: 1, name: "Australia", officialName: "Australian Grand Prix", circuit: "Albert Park Circuit", location: "Melbourne", country: "Australia", countryCode: "AU", date: "2025-03-16", hasSprint: false, season: 2025 },
    { round: 2, name: "China", officialName: "Chinese Grand Prix", circuit: "Shanghai International Circuit", location: "Shanghai", country: "China", countryCode: "CN", date: "2025-03-23", hasSprint: true, season: 2025 },
    { round: 3, name: "Japan", officialName: "Japanese Grand Prix", circuit: "Suzuka International Racing Course", location: "Suzuka", country: "Japan", countryCode: "JP", date: "2025-04-06", hasSprint: false, season: 2025 },
    { round: 4, name: "Bahrain", officialName: "Bahrain Grand Prix", circuit: "Bahrain International Circuit", location: "Sakhir", country: "Bahrain", countryCode: "BH", date: "2025-04-13", hasSprint: false, season: 2025 },
    { round: 5, name: "Saudi Arabia", officialName: "Saudi Arabian Grand Prix", circuit: "Jeddah Corniche Circuit", location: "Jeddah", country: "Saudi Arabia", countryCode: "SA", date: "2025-04-20", hasSprint: false, season: 2025 },
    { round: 6, name: "Miami", officialName: "Miami Grand Prix", circuit: "Miami International Autodrome", location: "Miami", country: "United States", countryCode: "US", date: "2025-05-04", hasSprint: true, season: 2025 },
    { round: 7, name: "Emilia-Romagna", officialName: "Emilia Romagna Grand Prix", circuit: "Autodromo Enzo e Dino Ferrari", location: "Imola", country: "Italy", countryCode: "IT", date: "2025-05-18", hasSprint: false, season: 2025 },
    { round: 8, name: "Monaco", officialName: "Monaco Grand Prix", circuit: "Circuit de Monaco", location: "Monte Carlo", country: "Monaco", countryCode: "MC", date: "2025-05-25", hasSprint: false, season: 2025 },
    { round: 9, name: "Spain", officialName: "Spanish Grand Prix", circuit: "Circuit de Barcelona-Catalunya", location: "Barcelona", country: "Spain", countryCode: "ES", date: "2025-06-01", hasSprint: false, season: 2025 },
    { round: 10, name: "Canada", officialName: "Canadian Grand Prix", circuit: "Circuit Gilles Villeneuve", location: "Montréal", country: "Canada", countryCode: "CA", date: "2025-06-15", hasSprint: false, season: 2025 },
    { round: 11, name: "Austria", officialName: "Austrian Grand Prix", circuit: "Red Bull Ring", location: "Spielberg", country: "Austria", countryCode: "AT", date: "2025-06-29", hasSprint: false, season: 2025 },
    { round: 12, name: "Great Britain", officialName: "British Grand Prix", circuit: "Silverstone Circuit", location: "Silverstone", country: "United Kingdom", countryCode: "GB", date: "2025-07-06", hasSprint: false, season: 2025 },
    { round: 13, name: "Belgium", officialName: "Belgian Grand Prix", circuit: "Circuit de Spa-Francorchamps", location: "Stavelot", country: "Belgium", countryCode: "BE", date: "2025-07-27", hasSprint: true, season: 2025 },
    { round: 14, name: "Hungary", officialName: "Hungarian Grand Prix", circuit: "Hungaroring", location: "Budapest", country: "Hungary", countryCode: "HU", date: "2025-08-03", hasSprint: false, season: 2025 },
    { round: 15, name: "Netherlands", officialName: "Dutch Grand Prix", circuit: "Circuit Zandvoort", location: "Zandvoort", country: "Netherlands", countryCode: "NL", date: "2025-08-31", hasSprint: false, season: 2025 },
    { round: 16, name: "Italy", officialName: "Italian Grand Prix", circuit: "Autodromo Nazionale di Monza", location: "Monza", country: "Italy", countryCode: "IT", date: "2025-09-07", hasSprint: false, season: 2025 },
    { round: 17, name: "Azerbaijan", officialName: "Azerbaijan Grand Prix", circuit: "Baku City Circuit", location: "Baku", country: "Azerbaijan", countryCode: "AZ", date: "2025-09-21", hasSprint: false, season: 2025 },
    { round: 18, name: "Singapore", officialName: "Singapore Grand Prix", circuit: "Marina Bay Street Circuit", location: "Singapore", country: "Singapore", countryCode: "SG", date: "2025-10-05", hasSprint: false, season: 2025 },
    { round: 19, name: "United States", officialName: "United States Grand Prix", circuit: "Circuit of the Americas", location: "Austin", country: "United States", countryCode: "US", date: "2025-10-19", hasSprint: true, season: 2025 },
    { round: 20, name: "Mexico", officialName: "Mexico City Grand Prix", circuit: "Autódromo Hermanos Rodríguez", location: "Mexico City", country: "Mexico", countryCode: "MX", date: "2025-10-26", hasSprint: false, season: 2025 },
    { round: 21, name: "São Paulo", officialName: "São Paulo Grand Prix", circuit: "Autódromo José Carlos Pace", location: "São Paulo", country: "Brazil", countryCode: "BR", date: "2025-11-09", hasSprint: true, season: 2025 },
    { round: 22, name: "Las Vegas", officialName: "Las Vegas Grand Prix", circuit: "Las Vegas Strip Circuit", location: "Las Vegas", country: "United States", countryCode: "US", date: "2025-11-22", hasSprint: false, season: 2025 },
    { round: 23, name: "Qatar", officialName: "Qatar Grand Prix", circuit: "Lusail International Circuit", location: "Lusail", country: "Qatar", countryCode: "QA", date: "2025-11-30", hasSprint: true, season: 2025 },
    { round: 24, name: "Abu Dhabi", officialName: "Abu Dhabi Grand Prix", circuit: "Yas Marina Circuit", location: "Abu Dhabi", country: "UAE", countryCode: "AE", date: "2025-12-07", hasSprint: false, season: 2025 },
];

export function getNextRace(calendar: Race[]): Race | null {
    const now = new Date();
    for (const race of calendar) {
        const raceDate = new Date(race.date);
        if (raceDate >= now) {
            return race;
        }
    }
    return calendar[calendar.length - 1];
}

export function getTimeUntilRace(race: Race): { days: number; hours: number; minutes: number; seconds: number } {
    const now = new Date();
    const raceDate = new Date(race.date);
    const diff = raceDate.getTime() - now.getTime();

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}
