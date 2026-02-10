export interface WatchOption {
    country: string;
    countryCode: string;
    platforms: Platform[];
}

export interface Platform {
    name: string;
    type: "tv" | "streaming" | "free";
    url: string;
    notes: string;
}

export const watchOptions: WatchOption[] = [
    {
        country: "United States",
        countryCode: "US",
        platforms: [
            { name: "ESPN / ESPN2 / ABC", type: "tv", url: "https://www.espn.com/f1/", notes: "All races televised. Select races on ABC." },
            { name: "ESPN+", type: "streaming", url: "https://plus.espn.com/", notes: "Selected races available for streaming." },
            { name: "F1 TV Pro", type: "streaming", url: "https://f1tv.formula1.com/", notes: "Full access to all sessions, onboard cameras, team radio." },
            { name: "Fubo TV", type: "streaming", url: "https://www.fubo.tv/", notes: "Watch ESPN channels live without cable." },
            { name: "Apple TV+ (2026)", type: "streaming", url: "https://tv.apple.com/", notes: "Starting 2026, all F1 races exclusive to Apple TV+." },
        ],
    },
    {
        country: "United Kingdom",
        countryCode: "GB",
        platforms: [
            { name: "Sky Sports F1", type: "tv", url: "https://www.skysports.com/f1", notes: "Full live coverage of all sessions." },
            { name: "NOW TV", type: "streaming", url: "https://www.nowtv.com/", notes: "Stream Sky Sports via NOW membership." },
            { name: "Channel 4", type: "free", url: "https://www.channel4.com/", notes: "Free highlights of every race." },
        ],
    },
    {
        country: "Australia",
        countryCode: "AU",
        platforms: [
            { name: "Fox Sports", type: "tv", url: "https://www.foxsports.com.au/", notes: "Live races via Foxtel." },
            { name: "Kayo Sports", type: "streaming", url: "https://kayosports.com.au/", notes: "Stream all races live." },
            { name: "10Play", type: "free", url: "https://10play.com.au/", notes: "Free race highlights." },
        ],
    },
    {
        country: "Canada",
        countryCode: "CA",
        platforms: [
            { name: "TSN (English)", type: "tv", url: "https://www.tsn.ca/", notes: "All sessions broadcast in English." },
            { name: "RDS (French)", type: "tv", url: "https://www.rds.ca/", notes: "All sessions in French." },
            { name: "TSN+", type: "streaming", url: "https://www.tsn.ca/", notes: "Streaming option for cord-cutters." },
            { name: "F1 TV Pro", type: "streaming", url: "https://f1tv.formula1.com/", notes: "Full onboard & data access." },
        ],
    },
    {
        country: "India",
        countryCode: "IN",
        platforms: [
            { name: "FanCode", type: "streaming", url: "https://www.fancode.com/", notes: "Livestreams the entire F1 season." },
        ],
    },
    {
        country: "Global",
        countryCode: "GLOBAL",
        platforms: [
            { name: "F1 TV Pro", type: "streaming", url: "https://f1tv.formula1.com/", notes: "Available in 180+ countries. Onboard cameras, team radio, live timing." },
        ],
    },
];

export const f1Basics = {
    whatIsF1: "Formula 1 (F1) is the highest class of international racing for open-wheel single-seater formula racing cars. It's the most prestigious and technologically advanced motorsport in the world, featuring 20+ drivers from 10 teams competing across 24 races on circuits around the globe.",
    howPointsWork: [
        { position: "1st", points: 25 },
        { position: "2nd", points: 18 },
        { position: "3rd", points: 15 },
        { position: "4th", points: 12 },
        { position: "5th", points: 10 },
        { position: "6th", points: 8 },
        { position: "7th", points: 6 },
        { position: "8th", points: 4 },
        { position: "9th", points: 2 },
        { position: "10th", points: 1 },
        { position: "Fastest Lap*", points: 1 },
    ],
    keyTerms: [
        { term: "DRS", definition: "Drag Reduction System — a movable rear wing flap that opens on straights to help overtaking. Only available in designated DRS zones when within 1 second of the car ahead." },
        { term: "Pit Stop", definition: "When a car enters the pit lane to change tires, make repairs, or adjust front wing. Top teams complete tire changes in under 2 seconds." },
        { term: "Qualifying", definition: "Saturday session that determines the starting grid. Three rounds (Q1, Q2, Q3) eliminate drivers progressively. The fastest in Q3 earns Pole Position." },
        { term: "Pole Position", definition: "The first place on the starting grid, awarded to the fastest qualifier." },
        { term: "Undercut", definition: "Strategic move where a driver pits earlier than a rival to gain track position on fresh tires." },
        { term: "Safety Car", definition: "Deployed when track conditions are unsafe. The field bunches up behind the safety car at reduced speed." },
        { term: "Sprint Race", definition: "A shorter race (about 100km) held on Saturdays at select events, awarding points to the top 8 finishers." },
        { term: "Constructors' Championship", definition: "The team championship — both drivers' points are combined. This determines prize money and prestige." },
    ],
    raceWeekendFormat: [
        { day: "Friday", sessions: ["Free Practice 1 (FP1)", "Free Practice 2 (FP2)"] },
        { day: "Saturday", sessions: ["Free Practice 3 (FP3)", "Qualifying (Q1 → Q2 → Q3)"] },
        { day: "Sunday", sessions: ["The Grand Prix (Race)"] },
    ],
    sprintWeekendFormat: [
        { day: "Friday", sessions: ["Free Practice 1 (FP1)", "Sprint Qualifying (SQ)"] },
        { day: "Saturday", sessions: ["Sprint Race", "Qualifying (Q1 → Q2 → Q3)"] },
        { day: "Sunday", sessions: ["The Grand Prix (Race)"] },
    ],
};
