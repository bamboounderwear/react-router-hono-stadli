export type TeamProfile = {
        name: string;
        city: string;
        founded: number;
        arena: string;
        colors: string[];
        tagline: string;
        record: string;
};

export type Player = {
        id: string;
        number: number;
        name: string;
        position: string;
        hometown: string;
        bio: string;
        stats: {
                games: number;
                goals: number;
                assists: number;
        };
};

export type StaffMember = {
        id: string;
        name: string;
        role: string;
        experience: string;
};

export type GalleryItem = {
        id: string;
        title: string;
        description: string;
        imageUrl: string;
};

export type NewsArticle = {
        slug: string;
        title: string;
        summary: string;
        content: string;
        category: string;
        publishedAt: string;
        imageUrl: string;
        author: string;
};

export type Game = {
        id: string;
        opponent: string;
        venue: string;
        date: string;
        isHome: boolean;
        status: "final" | "upcoming";
        score?: string;
        recap?: string;
        highlights: string[];
        heroImage: string;
};

export type ShopItem = {
        id: string;
        name: string;
        price: number;
        description: string;
        details: string[];
        colors: string[];
        sizes: string[];
        imageUrl: string;
        badge?: string;
};

const teamProfile: TeamProfile = {
        name: "Stadli Storm",
        city: "Stadli, Switzerland",
        founded: 1996,
        arena: "Aurora Field",
        colors: ["Midnight Blue", "Silver", "Arctic White"],
        tagline: "Forged in the alpine winds.",
        record: "18-4-0",
};

const roster: Player[] = [
        {
                id: "ava-hart",
                number: 11,
                name: "Ava Hart",
                position: "Forward",
                hometown: "Stadli, CH",
                bio: "Captain and leading scorer known for her lightning quick first step and relentless pressure on the break.",
                stats: {
                        games: 32,
                        goals: 24,
                        assists: 18,
                },
        },
        {
                id: "mina-cho",
                number: 4,
                name: "Mina Cho",
                position: "Midfielder",
                hometown: "Busan, KR",
                bio: "Tempo-setting playmaker who orchestrates the attack with precision passing and a tireless work rate.",
                stats: {
                        games: 32,
                        goals: 6,
                        assists: 27,
                },
        },
        {
                id: "lina-schneider",
                number: 27,
                name: "Lina Schneider",
                position: "Defender",
                hometown: "Munich, DE",
                bio: "Anchors the back line with fearless tackling and aerial dominance in set-piece situations.",
                stats: {
                        games: 32,
                        goals: 3,
                        assists: 5,
                },
        },
        {
                id: "noa-fernandez",
                number: 9,
                name: "Noa Fernandez",
                position: "Forward",
                hometown: "Lisbon, PT",
                bio: "Creative striker with a flair for highlight reel finishes and a knack for late-game heroics.",
                stats: {
                        games: 30,
                        goals: 19,
                        assists: 11,
                },
        },
        {
                id: "ivy-watts",
                number: 6,
                name: "Ivy Watts",
                position: "Wingback",
                hometown: "Seattle, US",
                bio: "Two-way threat who stretches the field with overlapping runs and locks down opposing wingers.",
                stats: {
                        games: 31,
                        goals: 5,
                        assists: 14,
                },
        },
        {
                id: "zuri-adebayo",
                number: 1,
                name: "Zuri Adebayo",
                position: "Goalkeeper",
                hometown: "Lagos, NG",
                bio: "Shot-stopping specialist with commanding presence in the box and league-leading clean sheets.",
                stats: {
                        games: 32,
                        goals: 0,
                        assists: 1,
                },
        },
];

const staff: StaffMember[] = [
        {
                id: "ellie-marks",
                name: "Ellie Marks",
                role: "Head Coach",
                experience: "Former national team midfielder entering her fifth season leading the Storm.",
        },
        {
                id: "suri-das",
                name: "Suri Das",
                role: "Assistant Coach",
                experience: "Set-piece strategist recognized for innovative training routines.",
        },
        {
                id: "jules-meyer",
                name: "Jules Meyer",
                role: "Performance Director",
                experience: "Sports scientist focused on data-driven recovery and strength programs.",
        },
];

const gallery: GalleryItem[] = [
        {
                id: "walkout",
                title: "Matchday Walkout",
                description: "The Storm take the pitch to a roar of alpine thunder.",
                imageUrl: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80",
        },
        {
                id: "celebration",
                title: "Last-Minute Winner",
                description: "Noa Fernandez celebrates the match-clinching volley.",
                imageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
        },
        {
                id: "supporters",
                title: "Supporters Section",
                description: "The Tempest fan club painting the night sky silver and blue.",
                imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
        },
];

const newsArticles: NewsArticle[] = [
        {
                slug: "storm-dominate-season-opener",
                title: "Storm Dominate Season Opener Against Zurich",
                summary: "Ava Hart nets a brace and the Storm defense shuts down Zurich in a statement victory.",
                content:
                        "The Stadli Storm launched the new campaign with an emphatic 3-0 win over FC Zurich at Aurora Field. Captain Ava Hart struck twice in the opening 30 minutes, converting a looping cross from Mina Cho before curling a free kick into the top corner. The back line, marshalled by Lina Schneider, held Zurich to a single shot on target. Keeper Zuri Adebayo collected her first clean sheet of the season while debutant Ivy Watts assisted on the final goal in the 78th minute. Coach Ellie Marks praised the balance and energy of the squad, noting that the team \"played on the front foot from the opening whistle.\"",
                category: "Match Report",
                publishedAt: "2024-03-08T18:30:00.000Z",
                imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
                author: "Kiera Solis",
        },
        {
                slug: "stadli-unveils-future-academy",
                title: "Stadli Unveils Future Academy Training Center",
                summary: "State-of-the-art youth facility opens its doors to nurture the next generation of Storm talent.",
                content:
                        "The Storm officially opened the Future Academy this week, a modern complex designed to develop youth talent from across the alpine region. The center features five hybrid pitches, an analytics hub, and dedicated classrooms for leadership workshops. Academy director Jules Meyer emphasized the club's commitment to holistic development, highlighting scholarships available to underserved communities. The inaugural class includes 40 players who will train alongside the senior team throughout the season.",
                category: "Club News",
                publishedAt: "2024-02-22T10:00:00.000Z",
                imageUrl: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80",
                author: "Editorial Staff",
        },
        {
                slug: "ava-hart-wins-player-of-month",
                title: "Ava Hart Wins League Player of the Month",
                summary: "Four goals and three assists in February earn Hart top honors across the league.",
                content:
                        "League officials recognized Ava Hart as Player of the Month following a blistering run of form. Hart tallied four goals and three assists in four matches, including a stoppage-time winner in Bern. She credited midfield partner Mina Cho for providing \"perfect service\" and celebrated the award with a training session for the Future Academy strikers. Coach Marks noted that Hart's leadership \"keeps the locker room fearless.\"",
                category: "Honors",
                publishedAt: "2024-03-02T08:00:00.000Z",
                imageUrl: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=80",
                author: "Tristan Leuenberger",
        },
];

const games: Game[] = [
        {
                id: "2024-03-12-zurich",
                opponent: "FC Zurich",
                venue: "Aurora Field",
                date: "2024-03-12T19:00:00.000Z",
                isHome: true,
                status: "final",
                score: "3 - 0",
                recap:
                        "The Storm dominated possession and capitalized on set pieces, with Hart recording a brace and Ivy Watts sealing the victory late.",
                highlights: ["Hart opens scoring in 14th minute", "Adebayo saves penalty to preserve clean sheet", "Watts volley secures 3-0 win"],
                heroImage: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1400&q=80",
        },
        {
                id: "2024-03-19-bern",
                opponent: "Bern United",
                venue: "Summit Dome",
                date: "2024-03-19T18:30:00.000Z",
                isHome: false,
                status: "upcoming",
                highlights: ["Tempest supporters traveling section", "Projected snowfall at kickoff", "Top of the table clash"],
                heroImage: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=80",
        },
        {
                id: "2024-03-26-lucerne",
                opponent: "Lucerne Waves",
                venue: "Aurora Field",
                date: "2024-03-26T19:30:00.000Z",
                isHome: true,
                status: "upcoming",
                highlights: ["Retro kit night", "Halftime youth clinic showcase", "Post-match autograph session"],
                heroImage: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1400&q=80",
        },
];

const shopInventory: ShopItem[] = [
        {
                id: "home-kit",
                name: "2024 Home Kit",
                price: 119,
                description: "Midnight blue jersey with alpine silver trim and heat-pressed crest.",
                details: ["Lightweight moisture-wicking fabric", "Slim athletic cut", "Authentic league badge"],
                colors: ["Midnight Blue"],
                sizes: ["XS", "S", "M", "L", "XL", "XXL"],
                imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80",
                badge: "Best Seller",
        },
        {
                id: "away-scarf",
                name: "Glacier Scarf",
                price: 32,
                description: "Double-sided knit scarf featuring the Tempest supporters mantra.",
                details: ["Soft acrylic knit", "Reversible design", "Limited first run"],
                colors: ["Glacier White", "Sky Blue"],
                sizes: ["One Size"],
                imageUrl: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80",
        },
        {
                id: "training-top",
                name: "Velocity Training Top",
                price: 74,
                description: "Quarter-zip top built for unpredictable alpine sessions.",
                details: ["Thermal fleece lining", "Storm shield thumb loops", "Zippered media pocket"],
                colors: ["Steel Gray", "Aurora Green"],
                sizes: ["XS", "S", "M", "L", "XL"],
                imageUrl: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=1200&q=80",
        },
];

export function getTeamProfile() {
        return teamProfile;
}

export function getRoster() {
        return roster;
}

export function getStaff() {
        return staff;
}

export function getGallery() {
        return gallery;
}

export function getNewsArticles() {
        return newsArticles;
}

export function getNewsArticle(slug: string) {
        const article = newsArticles.find((item) => item.slug === slug);
        if (!article) {
                return undefined;
        }
        return article;
}

export function getGames() {
        return games;
}

export function getGame(id: string) {
        const game = games.find((item) => item.id === id);
        if (!game) {
                return undefined;
        }
        return game;
}

export function getShopItems() {
        return shopInventory;
}

export function getShopItem(id: string) {
        const item = shopInventory.find((product) => product.id === id);
        if (!item) {
                return undefined;
        }
        return item;
}
