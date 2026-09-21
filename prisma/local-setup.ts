import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import readingTimeOf from "reading-time";

const DATA_DIR = path.join(process.cwd(), ".pglite-data");
const SCHEMA_SQL = path.join(process.cwd(), "prisma", "pglite-schema.sql");

function slug(s: string) {
  return slugify(s, { lower: true, strict: true });
}

function paragraphs(html: string) {
  return html.trim();
}

async function applySchemaIfNeeded(client: PGlite) {
  const exists = await client.query(
    `SELECT to_regclass('public."User"') as reg;`
  );
  const already = (exists.rows[0] as { reg: string | null }).reg !== null;
  if (already) {
    console.log("[local-setup] Schema already applied, skipping.");
    return;
  }
  console.log("[local-setup] Applying schema...");
  const sql = fs.readFileSync(SCHEMA_SQL, "utf8");
  await client.exec(sql);
  console.log("[local-setup] Schema applied.");
}

async function main() {
  const isFresh = !fs.existsSync(DATA_DIR);
  const client = new PGlite(DATA_DIR);
  await applySchemaIfNeeded(client);

  const adapter = new PrismaPGlite(client);
  const prisma = new PrismaClient({ adapter });

  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "change-me-now";
  const name = process.env.ADMIN_NAME ?? "Admin";
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash, role: "ADMIN" },
  });

  const categoryDefs = [
    { name: "DeFi", slug: "defi" },
    { name: "NFTs", slug: "nfts" },
    { name: "Regulation", slug: "regulation" },
    { name: "Markets", slug: "markets" },
    { name: "Technology", slug: "technology" },
  ];
  const categories: Record<string, { id: string }> = {};
  for (const c of categoryDefs) {
    categories[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  async function tagRefs(names: string[]) {
    const refs = [];
    for (const n of names) {
      const t = await prisma.tag.upsert({
        where: { slug: slug(n) },
        update: {},
        create: { name: n, slug: slug(n) },
      });
      refs.push({ id: t.id });
    }
    return refs;
  }

  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000);

  const articles = [
    {
      title:
        "Ethereum Restaking TVL Crosses $20B as EigenLayer Competitors Multiply",
      category: "defi",
      tags: ["ethereum", "defi", "restaking", "eigenlayer"],
      featured: true,
      publishedAt: daysAgo(0),
      cover: "restaking",
      excerpt:
        "A wave of new restaking protocols is chasing EigenLayer's lead, and the combined total value locked across the sector just crossed $20 billion for the first time.",
      html: `
<p>Restaking has quietly become one of the largest categories in decentralized finance. Combined total value locked across EigenLayer and a growing field of challengers crossed <strong>$20 billion</strong> this week, according to on-chain data aggregators — roughly triple where the sector stood a year ago.</p>
<h2>Why restaking took off</h2>
<p>The pitch is simple: let validators who already secure Ethereum "restake" that same capital to secure additional networks and middleware, earning extra yield without spinning up new capital. For an industry starved of sustainable yield since the last cycle's collapse in unsustainable emissions, that proposition proved irresistible.</p>
<blockquote>"Restaking turned idle security budget into a tradable commodity. That's a genuinely new primitive, not just another yield wrapper," said one researcher at a major Ethereum infrastructure firm.</blockquote>
<h2>Competition heats up</h2>
<p>At least four new protocols have launched restaking markets in the past quarter, each courting liquidity with points programs and token incentives reminiscent of the 2021 DeFi summer playbook. Analysts are split on whether this represents durable demand or another incentive-driven bubble.</p>
<ul>
<li>EigenLayer retains roughly 60% market share of restaked ETH</li>
<li>Symbiotic and Karak have both surpassed $2B in TVL</li>
<li>At least three new AVS (actively validated services) launched mainnet this month</li>
</ul>
<p>Regulators have taken notice too, with several officials publicly questioning whether restaking introduces new forms of systemic risk by concentrating slashing conditions across multiple protocols on the same underlying validator set.</p>
`,
    },
    {
      title: "Uniswap v5 Proposal Sparks Governance Battle Over Fee Switch",
      category: "defi",
      tags: ["defi", "uniswap", "governance", "ethereum"],
      publishedAt: daysAgo(1),
      cover: "uniswap",
      excerpt:
        "A new governance proposal to activate protocol-wide fees on Uniswap has split the DAO, reigniting a debate that has simmered for three years.",
      html: `
<p>Uniswap's governance forum lit up this week after a delegate proposed activating the long-dormant "fee switch" as part of a broader v5 upgrade package, redirecting a slice of trading fees from liquidity providers to UNI token holders.</p>
<h2>The core disagreement</h2>
<p>Supporters argue the protocol has generated billions in fees over its lifetime with none of it accruing to the token that governs it. Opponents warn that diverting fees away from liquidity providers could push volume toward competing DEXs with tighter spreads.</p>
<blockquote>"Every basis point we take from LPs is a basis point of edge we hand to Curve, Balancer, and every aggregator route around us," one prominent LP wrote in the forum thread.</blockquote>
<p>A non-binding temperature check is expected to close within the week, with a binding on-chain vote likely to follow next month if sentiment holds.</p>
`,
    },
    {
      title:
        "Blue-Chip NFT Floors Rebound as On-Chain Gaming Assets Gain Traction",
      category: "nfts",
      tags: ["nft", "gaming", "ethereum"],
      publishedAt: daysAgo(2),
      cover: "nftgaming",
      excerpt:
        "After eighteen months of grinding declines, floor prices across several flagship NFT collections have posted their strongest weekly gains since 2023 — and gaming assets are leading the charge.",
      html: `
<p>NFT floor prices across a handful of blue-chip collections rose double digits this week, snapping a long downtrend that has defined the sector since the last bull cycle peaked.</p>
<h2>Gaming assets in the driver's seat</h2>
<p>Unlike prior rallies driven by speculative PFP trading, this move has been concentrated in collections tied to functioning on-chain games — in-game land, equipment, and character NFTs that carry ongoing utility rather than pure collectibility.</p>
<ul>
<li>In-game land parcels for a top on-chain strategy game up 40% week-over-week</li>
<li>Marketplace volume for utility-bearing NFTs outpaced pure art collections for the first time this cycle</li>
<li>Several studios announced new play-and-earn seasons timed to the rally</li>
</ul>
<p>Whether the move has legs will likely hinge on whether these games can retain active players once initial incentive emissions taper off — a pattern that has burned NFT gaming before.</p>
`,
    },
    {
      title: "Pudgy Penguins' Toy Line Hits Target Shelves Nationwide",
      category: "nfts",
      tags: ["nft", "brands"],
      publishedAt: daysAgo(4),
      cover: "toys",
      excerpt:
        "The physical toy line based on the Pudgy Penguins NFT collection is now available in Target stores across the US, marking one of the clearest Web3-to-mainstream retail crossovers yet.",
      html: `
<p>Plush toys and collectible figures based on the Pudgy Penguins NFT collection began appearing on Target shelves this week, following a limited rollout at Walmart earlier this year.</p>
<p>The collection's holding company has leaned heavily into consumer products as a strategy for building a brand that outlives any single market cycle — a playbook few NFT projects have successfully executed.</p>
<blockquote>"We stopped thinking of ourselves as an NFT project two years ago. We're a toy and media company that happens to use blockchain for provenance," the project's CEO said in a recent interview.</blockquote>
<p>Early sales data shared by the company suggests the toy line is outperforming internal projections, though it remains to be seen whether that translates into renewed demand for the underlying NFTs.</p>
`,
    },
    {
      title: "SEC Drops Appeal in Landmark Crypto Exchange Case",
      category: "regulation",
      tags: ["regulation", "sec", "policy"],
      publishedAt: daysAgo(1),
      cover: "courthouse",
      excerpt:
        "The Securities and Exchange Commission has formally withdrawn its appeal in a closely watched enforcement case, removing a major legal overhang for US exchanges.",
      html: `
<p>In a filing submitted late Friday, the SEC withdrew its appeal against a lower court ruling that had gone partially in favor of a major US crypto exchange, closing out one of the highest-profile enforcement actions of the past three years.</p>
<h2>What it means for the industry</h2>
<p>The decision removes a significant source of legal uncertainty that has hung over exchange listing decisions since the case was first filed. Several exchanges have already signaled they will revisit previously delisted assets in light of the outcome.</p>
<ul>
<li>Legal experts describe the withdrawal as a de facto acknowledgment that the agency's original theory was unlikely to survive appellate review</li>
<li>At least two other pending enforcement actions are expected to be affected by the precedent</li>
<li>Congressional staffers say the ruling adds momentum to pending market-structure legislation</li>
</ul>
<p>The agency's press office declined to comment beyond the filing itself.</p>
`,
    },
    {
      title: "EU's MiCA Framework Enters Final Enforcement Phase",
      category: "regulation",
      tags: ["regulation", "europe", "policy"],
      publishedAt: daysAgo(5),
      cover: "eu",
      excerpt:
        "Europe's Markets in Crypto-Assets regulation is now fully in force, and national regulators across the bloc have begun issuing the first wave of compliance notices.",
      html: `
<p>The final phase of the EU's Markets in Crypto-Assets (MiCA) regulation took effect this week, requiring all crypto-asset service providers operating in the bloc to hold a license from a national regulator.</p>
<p>Several smaller exchanges have already announced they will geo-block EU users rather than pursue licensing, while larger platforms have spent the better part of two years preparing compliance infrastructure.</p>
<blockquote>"MiCA is the most comprehensive crypto framework any major jurisdiction has shipped. Whether it becomes the global template or a cautionary tale depends entirely on execution over the next eighteen months," said a policy analyst at a Brussels-based think tank.</blockquote>
`,
    },
    {
      title: "Bitcoin Holds $90K Support as ETF Inflows Hit Three-Week High",
      category: "markets",
      tags: ["bitcoin", "markets", "etf"],
      publishedAt: daysAgo(0),
      cover: "btcchart",
      excerpt:
        "Spot Bitcoin ETFs pulled in their largest single-day inflow in three weeks as price action stabilized above the closely watched $90,000 level.",
      html: `
<p>Bitcoin held firm above $90,000 through a volatile trading session as US spot ETFs recorded their strongest inflow day in three weeks, according to issuer data.</p>
<h2>Flows tell the story</h2>
<p>Net inflows across the major spot ETF products topped $600 million on the day, reversing a two-week stretch of muted demand that had coincided with broader risk-asset weakness.</p>
<ul>
<li>Combined ETF holdings now represent roughly 6% of circulating supply</li>
<li>Futures funding rates remain neutral, suggesting limited leveraged froth</li>
<li>Realized volatility has compressed to its lowest level since early in the year</li>
</ul>
<p>Traders will be watching whether inflows can sustain into next week's macro data releases, which have been a recurring source of volatility this quarter.</p>
`,
    },
    {
      title: "Altcoin Season Index Flashes Green for First Time Since Q1",
      category: "markets",
      tags: ["markets", "altcoins"],
      publishedAt: daysAgo(3),
      cover: "altcoins",
      excerpt:
        "A widely followed measure of altcoin outperformance versus Bitcoin has crossed into 'altcoin season' territory for the first time this year.",
      html: `
<p>The Altcoin Season Index, which tracks how many of the top 50 tokens by market cap are outperforming Bitcoin over a rolling 90-day window, crossed above 75 this week — the threshold typically used to define an "altcoin season."</p>
<p>Breadth has been the standout feature of the move: rather than a handful of large-cap tokens driving the index, gains have been broad-based across layer-1s, DeFi tokens, and select mid-cap infrastructure plays.</p>
<blockquote>"Breadth like this either marks the start of a genuine rotation or the final blow-off before consolidation. History has examples of both," one market strategist noted.</blockquote>
`,
    },
    {
      title: "Solana's Firedancer Validator Client Reaches Mainnet Beta",
      category: "technology",
      tags: ["solana", "infrastructure", "layer1"],
      publishedAt: daysAgo(2),
      cover: "firedancer",
      excerpt:
        "Jump Crypto's independently built Firedancer validator client has entered mainnet beta on Solana, a milestone years in the making for the network's client diversity efforts.",
      html: `
<p>Firedancer, the from-scratch Solana validator client built by Jump Crypto, has officially entered mainnet beta, running alongside the network's original client on a growing share of stake.</p>
<h2>Why client diversity matters</h2>
<p>Solana has run on a single dominant client implementation for most of its history — a structural risk that Firedancer was specifically designed to address. A bug in a lone client can bring down an entire network; multiple independent implementations make that far less likely.</p>
<ul>
<li>Early benchmarks show significantly higher theoretical transaction throughput</li>
<li>Roughly 8% of stake has migrated to beta as of this week</li>
<li>Full network-wide rollout is targeted for later this year pending audit sign-off</li>
</ul>
<p>Validator operators have generally welcomed the milestone, though several noted that meaningful diversity benefits only materialize once a substantial share of stake has migrated.</p>
`,
    },
    {
      title: "Zero-Knowledge Rollups Now Process Half of All L2 Transactions",
      category: "technology",
      tags: ["ethereum", "layer2", "zk-rollups", "infrastructure"],
      publishedAt: daysAgo(6),
      cover: "zkrollup",
      excerpt:
        "Zero-knowledge rollups have overtaken optimistic rollups by transaction volume for the first time, according to a new report tracking Ethereum's layer-2 ecosystem.",
      html: `
<p>Zero-knowledge rollups now account for just over half of all transactions processed across Ethereum's layer-2 ecosystem, edging out optimistic rollups for the first time since the category emerged.</p>
<p>The shift comes as proving costs have fallen sharply thanks to hardware acceleration and recursive proof aggregation, narrowing the cost gap that had long favored optimistic designs for general-purpose execution.</p>
<blockquote>"Two years ago, ZK was a research bet. Today it's the default choice for any new rollup that isn't optimizing purely for EVM-bytecode compatibility," said one core developer working on proving infrastructure.</blockquote>
<p>Optimistic rollups retain an edge in EVM equivalence and tooling maturity, and several teams are pursuing hybrid designs that aim to capture the benefits of both approaches.</p>
`,
    },
  ];

  const createdArticles: { id: string; slug: string }[] = [];

  for (const a of articles) {
    const articleSlug = slug(a.title);
    const existing = await prisma.article.findUnique({
      where: { slug: articleSlug },
    });
    if (existing) {
      createdArticles.push({ id: existing.id, slug: existing.slug });
      continue;
    }

    const stats = readingTimeOf(a.html.replace(/<[^>]+>/g, " "));
    const tags = await tagRefs(a.tags);

    const created = await prisma.article.create({
      data: {
        title: a.title,
        slug: articleSlug,
        excerpt: a.excerpt,
        contentHtml: paragraphs(a.html),
        coverImage: `https://picsum.photos/seed/${a.cover}/1200/630`,
        status: "PUBLISHED",
        featured: Boolean(a.featured),
        readingTime: Math.max(1, Math.round(stats.minutes)),
        publishedAt: a.publishedAt,
        authorId: admin.id,
        categoryId: categories[a.category].id,
        seoTitle: a.title,
        seoDescription: a.excerpt,
        views: Math.floor(Math.random() * 4000) + 50,
        tags: { connect: tags },
      },
    });
    createdArticles.push({ id: created.id, slug: created.slug });
  }

  const wallets = [
    "0x71C7656EC7ab88b098defB751B7401B5f6d8976",
    "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
    "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
  ];

  const featuredArticle = createdArticles[0];
  if (featuredArticle) {
    await prisma.comment.upsert({
      where: { id: "seed-comment-1" },
      update: {},
      create: {
        id: "seed-comment-1",
        articleId: featuredArticle.id,
        walletAddress: wallets[0],
        content:
          "Restaking is the most interesting primitive since liquid staking itself. Curious how slashing conditions get standardized across AVSs though.",
      },
    });
    await prisma.comment.upsert({
      where: { id: "seed-comment-2" },
      update: {},
      create: {
        id: "seed-comment-2",
        articleId: featuredArticle.id,
        walletAddress: wallets[1],
        content: "$20B already? This grew faster than I expected honestly.",
      },
    });

    for (const [i, w] of wallets.entries()) {
      const type = i === 2 ? "BEARISH" : "BULLISH";
      await prisma.reaction.upsert({
        where: {
          articleId_walletAddress_type: {
            articleId: featuredArticle.id,
            walletAddress: w,
            type,
          },
        },
        update: {},
        create: { articleId: featuredArticle.id, walletAddress: w, type },
      });
    }
  }

  const subscriberEmails = [
    "satoshi.fan@example.com",
    "defi.degen@example.com",
    "onchain.reader@example.com",
    "web3.builder@example.com",
  ];
  for (const e of subscriberEmails) {
    await prisma.subscriber.upsert({
      where: { email: e },
      update: {},
      create: { email: e },
    });
  }

  console.log(`[local-setup] Admin: ${email} / ${password}`);
  console.log(`[local-setup] Articles: ${createdArticles.length}`);
  console.log(
    `[local-setup] Local PGlite database ready${isFresh ? " (freshly created)" : ""} at ${DATA_DIR}`
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
