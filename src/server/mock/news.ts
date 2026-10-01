import type { Category } from '@/types/content';

/** [headline, summary, publisher] */
type Seed = readonly [string, string, string];

/**
 * Hand-written fixture headlines. Used when NEWS_API_KEY is missing, when
 * NewsAPI fails or rate-limits, and in every automated test.
 */
export const NEWS_SEEDS: Record<Category, readonly Seed[]> = {
  technology: [
    [
      'Open-source browser engine hits 1.0 after five years of development',
      'The independent engine now passes most web platform tests and ships with a developer preview build.',
      'The Verge',
    ],
    [
      'Chipmakers race to ship on-device AI accelerators for laptops',
      'New silicon promises local inference for assistants without sending data to the cloud.',
      'Ars Technica',
    ],
    [
      'Major cloud provider cuts egress fees for startups',
      'The change lowers the cost of moving data out of the platform for companies under two years old.',
      'TechCrunch',
    ],
    [
      'Web developers adopt view transitions across frameworks',
      'Native page transitions are now supported in every major browser, replacing heavy animation libraries.',
      'Smashing Magazine',
    ],
    [
      'Researchers demonstrate a battery that charges in six minutes',
      'The solid-state prototype kept 90 percent of its capacity after 1,000 cycles.',
      'Wired',
    ],
    [
      'Smartphone shipments rise for the third straight quarter',
      'Analysts credit longer software support and trade-in programs for the rebound.',
      'Reuters',
    ],
    [
      'New passkey standard aims to end password resets',
      'Cross-device sync for passkeys is now part of the spec, removing a key adoption barrier.',
      'The Verge',
    ],
    [
      'Robotics startup unveils a warehouse arm that learns from video',
      'The arm picked unfamiliar items after watching short demonstrations recorded on a phone.',
      'TechCrunch',
    ],
    [
      'TypeScript usage overtakes JavaScript in new GitHub repositories',
      'The annual developer report shows typed code now dominates fresh open-source projects.',
      'InfoWorld',
    ],
    [
      'Satellite internet speeds double after constellation upgrade',
      'Users in rural areas report median downloads above 200 megabits per second.',
      'Ars Technica',
    ],
    [
      'Accessibility lawsuits push retailers to rebuild checkout flows',
      'Keyboard navigation and screen reader support are now treated as release blockers.',
      'Wired',
    ],
    [
      'Edge computing networks expand to 300 cities',
      'Lower latency is opening new use cases for real-time collaboration apps.',
      'InfoWorld',
    ],
  ],
  business: [
    [
      'Central bank holds rates steady and signals two cuts next year',
      'Policymakers pointed to cooling inflation but said the labor market remains tight.',
      'Bloomberg',
    ],
    [
      'Global markets rally as energy prices ease',
      'Stocks in Europe and Asia climbed after crude fell to its lowest level in eight months.',
      'Financial Times',
    ],
    [
      'Fintech lender reaches profitability ahead of IPO plans',
      'The company credits lower customer acquisition costs and a shift to small-business loans.',
      'Reuters',
    ],
    [
      'Retail sales beat expectations during the festive season',
      'Online orders grew fastest, led by electronics and home goods.',
      'CNBC',
    ],
    [
      'Startup funding rebounds with record seed rounds',
      'Investors are backing smaller teams with longer runways rather than rapid hiring.',
      'Bloomberg',
    ],
    [
      'Airline earnings soar on strong international travel demand',
      'Premium cabins sold out on long-haul routes for most of the quarter.',
      'Financial Times',
    ],
    [
      'Electric vehicle maker cuts prices to defend market share',
      'The move follows a wave of cheaper models from new competitors.',
      'Reuters',
    ],
    [
      'Small businesses embrace four-day work weeks in pilot',
      'Most participating firms reported steady revenue and lower staff turnover.',
      'The Economist',
    ],
    [
      'Gold climbs to a record as investors seek safety',
      'Central bank purchases and currency swings continue to support prices.',
      'CNBC',
    ],
    [
      'Merger creates the largest regional payments network',
      'Regulators approved the deal with conditions on merchant fees.',
      'Bloomberg',
    ],
    [
      'Housing starts rise as mortgage rates dip',
      'Builders broke ground on more single-family homes than any month this year.',
      'Reuters',
    ],
    [
      'Streaming platforms bet on ad tiers to lift margins',
      'Cheaper ad-supported plans now account for most new subscribers.',
      'Financial Times',
    ],
  ],
  sports: [
    [
      'Underdogs clinch the title in a penalty shootout thriller',
      'A last-minute equalizer forced extra time before the goalkeeper saved two spot kicks.',
      'ESPN',
    ],
    [
      'Sprinter breaks a 15-year-old world record',
      'The 100-meter mark fell by four hundredths of a second in ideal conditions.',
      'BBC Sport',
    ],
    [
      'Cricket board announces a new day-night test series',
      'The pink-ball matches will be played across three countries next season.',
      'Cricbuzz',
    ],
    [
      'Tennis veteran announces retirement after final major',
      'Fans gave a standing ovation after the 20-year career came to a close.',
      'The Athletic',
    ],
    [
      'Basketball rookie posts a triple-double in debut',
      'The first overall pick finished with 21 points, 12 rebounds and 10 assists.',
      'ESPN',
    ],
    [
      'Marathon organizers add an adaptive athletes division',
      'The change brings equal prize money for wheelchair and para-athlete categories.',
      'BBC Sport',
    ],
    [
      'Formula 1 team unveils a radical new car design',
      'Engineers say the sidepod concept could reshape the competitive order.',
      'The Athletic',
    ],
    [
      'Womens football league reports record attendance',
      'Average crowds grew by 40 percent compared with last season.',
      'BBC Sport',
    ],
    [
      'Chess prodigy becomes the youngest grandmaster this decade',
      'The 13-year-old secured the final norm at an open tournament.',
      'Chess.com',
    ],
    [
      'Olympic committee confirms new sports for the next games',
      'Climbing, surfing and cricket will all feature on the program.',
      'Reuters',
    ],
    [
      'Cycling team wins mountain stage after a daring breakaway',
      'The attack on the final climb gained more than a minute on the leaders.',
      'Cycling News',
    ],
    [
      'Esports tournament prize pool crosses 40 million dollars',
      'Crowdfunding from in-game purchases pushed the total to a new high.',
      'The Verge',
    ],
  ],
  entertainment: [
    [
      'Indie film sweeps the festival awards with a debut director',
      'The low-budget drama won best picture, screenplay and lead performance.',
      'Variety',
    ],
    [
      'Streaming hit renewed for two more seasons',
      'The mystery series became the platform most-watched show this year.',
      'The Hollywood Reporter',
    ],
    [
      'Pop star announces a 60-city world tour',
      'Tickets for the first leg sold out within hours of going on sale.',
      'Billboard',
    ],
    [
      'Classic animated film gets a live-action remake date',
      'The studio confirmed the director and a summer release window.',
      'Variety',
    ],
    [
      'Video game adaptation breaks box office records',
      'The film earned the biggest opening weekend ever for a game adaptation.',
      'Deadline',
    ],
    [
      'Award-winning composer to score a new space epic',
      'The soundtrack will be recorded with a 90-piece orchestra.',
      'The Hollywood Reporter',
    ],
    [
      'Comedy special becomes the most streamed of the year',
      'Clips from the set have been viewed more than 200 million times.',
      'Rolling Stone',
    ],
    [
      'Museum opens an immersive exhibition on film history',
      'Visitors can walk through recreated sets from a century of cinema.',
      'The Guardian',
    ],
    [
      'Bollywood drama crosses a milestone at the global box office',
      'Strong overseas collections pushed the film into the all-time top ten.',
      'Variety',
    ],
    [
      'Music festival lineup mixes legends and newcomers',
      'Organizers added a stage dedicated to independent artists.',
      'Billboard',
    ],
    [
      'Podcast network signs a major deal for true-crime series',
      'The agreement includes video versions for streaming platforms.',
      'Deadline',
    ],
    [
      'Theatre revival extends its run after sold-out previews',
      'The production will now play through the end of next year.',
      'The Guardian',
    ],
  ],
  health: [
    [
      'Study links daily walking to lower heart disease risk',
      'Researchers found benefits started at around 7,000 steps per day.',
      'Healthline',
    ],
    [
      'New vaccine shows strong results in late-stage trials',
      'The shot reduced severe illness by more than 80 percent among older adults.',
      'Reuters Health',
    ],
    [
      'Doctors recommend earlier screening for colon cancer',
      'Updated guidelines lower the starting age to 45 for average-risk adults.',
      'Mayo Clinic News',
    ],
    [
      'Sleep researchers find weekend catch-up helps less than thought',
      'Consistent bedtimes mattered more than total hours slept.',
      'Healthline',
    ],
    [
      'Wearable sensor detects dehydration in athletes',
      'The patch alerts users before performance starts to drop.',
      'Wired Health',
    ],
    [
      'Mental health apps gain clinical validation',
      'Three apps met the evidence bar set by a national health agency.',
      'STAT',
    ],
    [
      'Mediterranean diet linked to sharper memory in older adults',
      'Participants following the diet scored higher on recall tests.',
      'Healthline',
    ],
    [
      'Hospitals adopt AI tools to cut emergency wait times',
      'Triage software helped staff prioritize patients more consistently.',
      'STAT',
    ],
    [
      'Global push to eliminate malaria gains new funding',
      'Donors pledged billions for bed nets and next-generation treatments.',
      'Reuters Health',
    ],
    [
      'Air quality alerts expand to more cities',
      'Real-time warnings now cover pollution, pollen and wildfire smoke.',
      'The Guardian',
    ],
    [
      'Strength training twice a week tied to longer life',
      'Combining weights with cardio produced the largest benefit.',
      'Mayo Clinic News',
    ],
    [
      'Researchers map the gut bacteria that influence mood',
      'The findings could guide new probiotic treatments for anxiety.',
      'STAT',
    ],
  ],
  science: [
    [
      'Telescope captures the most distant galaxy ever observed',
      'The light left the galaxy just 300 million years after the Big Bang.',
      'NASA',
    ],
    [
      'Fusion experiment sustains plasma for a record 20 minutes',
      'Engineers say the result is a key step toward practical fusion power.',
      'Nature',
    ],
    [
      'Scientists sequence the genome of an ancient wheat variety',
      'The data may help breed crops that withstand drought.',
      'Science Daily',
    ],
    [
      'Lunar lander confirms ice deposits near the south pole',
      'The water could support future crewed missions and fuel production.',
      'Space.com',
    ],
    [
      'Ocean expedition discovers dozens of new deep-sea species',
      'The finds include a transparent octopus and glowing coral.',
      'National Geographic',
    ],
    [
      'Quantum computer solves a chemistry problem beyond classical reach',
      'The simulation modeled a catalyst used in fertilizer production.',
      'Nature',
    ],
    [
      'Climate scientists record the warmest ocean temperatures yet',
      'Researchers warn of more intense storms and coral bleaching.',
      'Science Daily',
    ],
    [
      'Mars rover finds organic molecules in ancient lake bed',
      'The samples will be returned to Earth for detailed analysis.',
      'NASA',
    ],
    [
      'Researchers grow functional tooth enamel in the lab',
      'The technique could lead to repairs that last longer than fillings.',
      'New Scientist',
    ],
    [
      'Biologists record whales using names for each other',
      'Distinct calls appear to identify individual members of a pod.',
      'National Geographic',
    ],
    [
      'New material pulls drinking water from desert air',
      'A small panel produced several liters per day in field tests.',
      'New Scientist',
    ],
    [
      'Asteroid sample reveals building blocks of life',
      'Amino acids and minerals were found in dust brought back to Earth.',
      'Space.com',
    ],
  ],
};
