/* eslint-disable @typescript-eslint/no-explicit-any */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(
  /\\n/g,
  "\n",
);

if (!getApps()[0]) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const db = getFirestore();

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

type Tr = { title: string; description: string; highlights: string[] };
type TrMap = Record<"tr" | "en" | "de" | "ru", Tr>;

const makeTranslations = (base: {
  tr: Tr;
  en: Tr;
  de: Tr;
  ru: Tr;
}): TrMap => base;

const SEED_PROPERTIES: any[] = [
  {
    slug: "yalikavak-sea-view-villa",
    type: "villa",
    status: "satilik",
    region: "yalikavak",
    price: 4200000,
    currency: "EUR",
    specs: { areaGross: 520, areaNet: 460, bedrooms: 6, bathrooms: 6, yearBuilt: 2022, plotSize: 1800 },
    features: ["sea_view", "pool", "smart_home", "garden", "parking", "fireplace", "security", "air_conditioning"],
    translations: makeTranslations({
      tr: {
        title: "Yalıkavak'ta Denize Nazır Modern Villa",
        description: "Yalıkavak'ın kuzey yamacında, koya hâkim konumu ile bölgenin en nadide mülklerinden biri. Açık plan yaşam alanları, infinity havuz ve özel olarak tasarlanmış manzara terasları bir araya geliyor. İtalyan mermeri, Afrika cevizi ve yerel bazalt taşı birleşimi, sıcak ve zamansız bir atmosfer yaratıyor.",
        highlights: [
          "Infinity pool with sea view",
          "Smart home automation",
          "Double height living room",
          "Private garden 1,800 m²",
          "Staff / guest annex",
        ],
      },
      en: {
        title: "Modern Sea-View Villa in Yalıkavak",
        description: "On the northern slopes of Yalıkavak, overlooking the bay, this is one of the region's rarest properties. Open plan living, an infinity pool and custom-framed view terraces meet in quiet composition. Italian marble, African walnut and local basalt create a warm, timeless atmosphere.",
        highlights: [
          "Infinity pool with sea view",
          "Smart home automation",
          "Double height living room",
          "Private garden 1,800 m²",
          "Staff / guest annex",
        ],
      },
      de: {
        title: "Moderne Villa mit Meerblick in Yalıkavak",
        description: "An den nördlichen Hängen Yalıkavaks, mit Blick auf die Bucht, zählt dieses Anwesen zu den seltensten der Region. Offene Wohnräume, ein Infinity-Pool und maßgefertigte Terrassen bilden eine ruhige Komposition. Italienischer Marmor, afrikanischer Walnuss und lokaler Basalt schaffen eine warme, zeitlose Atmosphäre.",
        highlights: [
          "Infinity-Pool mit Meerblick",
          "Smart-Home-Steuerung",
          "Doppelhohes Wohnzimmer",
          "Privatgarten 1.800 m²",
          "Gäste- / Personalhaus",
        ],
      },
      ru: {
        title: "Современная вилла с видом на море в Ялыкаваке",
        description: "На северных склонах Ялыкавака, с видом на бухту, — одна из самых редких резиденций региона. Открытые жилые пространства, инфинити-бассейн и террасы с обрамлённым видом складываются в тихую композицию. Итальянский мрамор, африканский орех и местный базальт создают тёплую и вневременную атмосферу.",
        highlights: [
          "Инфинити-бассейн с видом на море",
          "Умный дом",
          "Двухсветная гостиная",
          "Частный сад 1 800 м²",
          "Гостевой/служебный флигель",
        ],
      },
    }),
    media: {
      cover: img("1613490493576-7fde63acd811"),
      gallery: [
        img("1613490493576-7fde63acd811"),
        img("1600585154340-be6161a56a0c"),
        img("1600566753376-12c8ab7fb75b"),
        img("1600607687939-ce8a6c25118c"),
        img("1600585154526-990dced4db0d"),
      ],
      videoUrl: null,
      virtualTourUrl: null,
    },
    featured: true,
  },
  {
    slug: "turkbuku-waterfront-residence",
    type: "villa",
    status: "satilik",
    region: "turkbuku",
    price: 3100000,
    currency: "EUR",
    specs: { areaGross: 380, areaNet: 340, bedrooms: 5, bathrooms: 5, yearBuilt: 2020, plotSize: 1200 },
    features: ["sea_view", "private_beach", "pool", "garden", "parking", "jacuzzi"],
    translations: makeTranslations({
      tr: {
        title: "Türkbükü'nde Denize Sıfır Konak",
        description: "Türkbükü'nün sakin koyunda, kendi iskelesi olan nadir mülklerden biri. Geniş teraslar, zeytin ağaçları arasında konumlanmış infinity havuz ve açık mutfak ile yaz yaşamının en zarif hali.",
        highlights: ["Private jetty", "Olive grove", "Outdoor kitchen", "Pool house"],
      },
      en: {
        title: "Waterfront Residence in Türkbükü",
        description: "In the quiet cove of Türkbükü, a rare property with its own jetty. Wide terraces, an infinity pool set among olive trees and an open kitchen compose the most refined expression of summer living.",
        highlights: ["Private jetty", "Olive grove", "Outdoor kitchen", "Pool house"],
      },
      de: {
        title: "Direkt am Wasser gelegene Residenz in Türkbükü",
        description: "In der ruhigen Bucht von Türkbükü: ein seltenes Anwesen mit eigenem Steg. Weite Terrassen, ein Infinity-Pool inmitten von Olivenbäumen und eine offene Küche.",
        highlights: ["Privater Steg", "Olivenhain", "Außenküche", "Poolhaus"],
      },
      ru: {
        title: "Резиденция у воды в Тюркбюкю",
        description: "В тихой бухте Тюркбюкю — редкая резиденция с собственным причалом. Широкие террасы, инфинити-бассейн среди оливковых деревьев и открытая кухня.",
        highlights: ["Частный причал", "Оливковая роща", "Летняя кухня", "Pool house"],
      },
    }),
    media: {
      cover: img("1600566753376-12c8ab7fb75b"),
      gallery: [
        img("1600566753376-12c8ab7fb75b"),
        img("1613977257363-707ba9348227"),
        img("1600607687939-ce8a6c25118c"),
        img("1600585154340-be6161a56a0c"),
      ],
    },
    featured: true,
  },
  {
    slug: "gumusluk-stone-house",
    type: "yazlik",
    status: "satilik",
    region: "gumusluk",
    price: 1450000,
    currency: "EUR",
    specs: { areaGross: 220, areaNet: 195, bedrooms: 4, bathrooms: 3, yearBuilt: 2015, plotSize: 650 },
    features: ["sea_view", "garden", "fireplace", "furnished"],
    translations: makeTranslations({
      tr: {
        title: "Gümüşlük'te Taş Yazlık",
        description: "Gümüşlük'ün balıkçı ruhunu koruyan, ustalıkla restore edilmiş bir taş ev. Tavanlar çıralı çam, zeminler tüm evde sade şıra mermer.",
        highlights: ["Stone masonry", "Pine ceilings", "Quiet backstreet", "5 min walk to marina"],
      },
      en: {
        title: "Restored Stone House in Gümüşlük",
        description: "A masterfully restored stone house preserving Gümüşlük's fishing-village soul. Pine ceilings, chora marble floors throughout.",
        highlights: ["Stone masonry", "Pine ceilings", "Quiet backstreet", "5 min walk to marina"],
      },
      de: {
        title: "Restauriertes Steinhaus in Gümüşlük",
        description: "Meisterhaft restauriertes Steinhaus, das die Seele des Fischerdorfes Gümüşlük bewahrt.",
        highlights: ["Natursteinmauerwerk", "Pinien-Decken", "Ruhige Seitenstraße", "5 Minuten zum Hafen"],
      },
      ru: {
        title: "Каменный дом в Гюмюшлюке",
        description: "Мастерски отреставрированный каменный дом, сохраняющий дух рыбацкой деревни Гюмюшлюк.",
        highlights: ["Каменная кладка", "Сосновые потолки", "Тихая улочка", "5 минут до марины"],
      },
    }),
    media: {
      cover: img("1583847268964-b28dc8f51f92"),
      gallery: [
        img("1583847268964-b28dc8f51f92"),
        img("1600585154340-be6161a56a0c"),
        img("1540541338287-41700207dee6"),
      ],
    },
    featured: true,
  },
  {
    slug: "golturkbuku-hillside-villa",
    type: "villa",
    status: "satilik",
    region: "golturkbuku",
    price: 5600000,
    currency: "EUR",
    specs: { areaGross: 620, areaNet: 540, bedrooms: 7, bathrooms: 7, yearBuilt: 2023, plotSize: 2400 },
    features: ["sea_view", "pool", "smart_home", "garden", "gym", "sauna", "security", "parking"],
    translations: makeTranslations({
      tr: {
        title: "Göltürkbükü Yamaç Villası",
        description: "Göltürkbükü'nün en yüksek noktasında, 180° koy manzarasına hâkim estetik bir villa. Japonya'dan getirilen sedir, yerel taş ve bronz detaylar.",
        highlights: ["180° bay view", "Wellness suite", "Private cinema"],
      },
      en: {
        title: "Göltürkbükü Hillside Villa",
        description: "At the highest point of Göltürkbükü, an aesthetic villa commanding a 180° bay view. Japanese cedar, local stone and bronze accents.",
        highlights: ["180° bay view", "Wellness suite", "Private cinema"],
      },
      de: {
        title: "Hanglage-Villa in Göltürkbükü",
        description: "Am höchsten Punkt von Göltürkbükü, eine ästhetische Villa mit 180°-Bucht-Blick.",
        highlights: ["180°-Buchtblick", "Wellness-Suite", "Privates Kino"],
      },
      ru: {
        title: "Вилла на склоне в Гёльтюркбюкю",
        description: "На самой высокой точке Гёльтюркбюкю — эстетичная вилла с 180° видом на бухту.",
        highlights: ["Вид 180°", "Велнес-зона", "Домашний кинотеатр"],
      },
    }),
    media: {
      cover: img("1600607687939-ce8a6c25118c"),
      gallery: [
        img("1600607687939-ce8a6c25118c"),
        img("1613490493576-7fde63acd811"),
        img("1600585154526-990dced4db0d"),
        img("1600566753376-12c8ab7fb75b"),
      ],
      virtualTourUrl: "https://my.matterport.com/show/?m=zEWsxhZpGba",
    },
    featured: true,
  },
  {
    slug: "yali-seafront-apartment",
    type: "daire",
    status: "satilik",
    region: "yali",
    price: 980000,
    currency: "EUR",
    specs: { areaGross: 160, areaNet: 140, bedrooms: 3, bathrooms: 2, yearBuilt: 2021 },
    features: ["sea_view", "pool", "parking", "security", "elevator", "air_conditioning"],
    translations: makeTranslations({
      tr: {
        title: "Yalı Sahil Dairesi",
        description: "Yalı'da denize nazır, bol ışıklı bir köşe dairesi. Site içinde havuz ve 24 saat güvenlik.",
        highlights: ["Corner apartment", "Panoramic sea view", "24/7 security"],
      },
      en: {
        title: "Seafront Apartment in Yalı",
        description: "A bright corner apartment on the Yalı seafront. Residence with shared pool and 24h security.",
        highlights: ["Corner apartment", "Panoramic sea view", "24/7 security"],
      },
      de: {
        title: "Apartment am Meer in Yalı",
        description: "Helle Eckwohnung an der Küste von Yalı.",
        highlights: ["Eckwohnung", "Panoramablick", "24/7 Sicherheit"],
      },
      ru: {
        title: "Квартира у моря в Ялы",
        description: "Светлая угловая квартира на набережной Ялы.",
        highlights: ["Угловая квартира", "Панорамный вид", "Охрана 24/7"],
      },
    }),
    media: {
      cover: img("1519046904884-53103b34b206"),
      gallery: [
        img("1519046904884-53103b34b206"),
        img("1600585154526-990dced4db0d"),
      ],
    },
  },
  {
    slug: "yalikavak-sea-view-land",
    type: "arsa",
    status: "satilik",
    region: "yalikavak",
    price: 2300000,
    currency: "EUR",
    specs: { plotSize: 3200 },
    features: ["sea_view"],
    translations: makeTranslations({
      tr: {
        title: "Yalıkavak Deniz Manzaralı Arsa",
        description: "Yalıkavak'ın üst kotlarında 3,200 m² imarlı villa arsası. Koy manzarası açık, alt yapı tamam.",
        highlights: ["Buildable villa land", "Clear bay view", "Utilities on site"],
      },
      en: {
        title: "Sea-view Land in Yalıkavak",
        description: "Buildable 3,200 m² plot on the upper slopes of Yalıkavak with clear bay view.",
        highlights: ["Buildable villa land", "Clear bay view", "Utilities on site"],
      },
      de: {
        title: "Grundstück mit Meerblick in Yalıkavak",
        description: "Bebaubares 3.200 m² Grundstück in den oberen Hängen Yalıkavaks.",
        highlights: ["Villa-Baugrund", "Freier Buchtblick", "Erschlossen"],
      },
      ru: {
        title: "Участок с видом на море в Ялыкаваке",
        description: "Застраиваемый участок 3 200 м² на верхних склонах Ялыкавака.",
        highlights: ["Под строительство виллы", "Открытый вид", "Коммуникации"],
      },
    }),
    media: {
      cover: img("1559128010-7c1ad6e1b6a5"),
      gallery: [img("1559128010-7c1ad6e1b6a5"), img("1537726235470-8504e3beef77")],
    },
  },
  {
    slug: "gundogan-designer-villa",
    type: "villa",
    status: "kiralik",
    region: "gundogan",
    price: 18000,
    currency: "EUR",
    specs: { areaGross: 340, areaNet: 300, bedrooms: 5, bathrooms: 5, yearBuilt: 2019, plotSize: 1100 },
    features: ["sea_view", "pool", "smart_home", "garden", "furnished", "parking"],
    translations: makeTranslations({
      tr: {
        title: "Gündoğan Tasarım Villası",
        description: "Yaz sezonu için özenle döşenmiş, İtalyan tasarım mobilyaları ile bir tatil evi. Aylık kiralık.",
        highlights: ["Fully furnished", "Weekly housekeeping", "Concierge"],
      },
      en: {
        title: "Designer Villa in Gündoğan",
        description: "A holiday home furnished with Italian design pieces, for summer rental.",
        highlights: ["Fully furnished", "Weekly housekeeping", "Concierge"],
      },
      de: {
        title: "Designer-Villa in Gündoğan",
        description: "Ein Ferienhaus mit italienischen Designmöbeln für die Sommersaison.",
        highlights: ["Voll möbliert", "Wöchentliche Reinigung", "Concierge"],
      },
      ru: {
        title: "Дизайнерская вилла в Гюндогане",
        description: "Дом для отдыха с итальянской дизайнерской мебелью на летний сезон.",
        highlights: ["Полностью меблирована", "Уборка раз в неделю", "Консьерж"],
      },
    }),
    media: {
      cover: img("1600585154526-990dced4db0d"),
      gallery: [
        img("1600585154526-990dced4db0d"),
        img("1600585154340-be6161a56a0c"),
        img("1540541338287-41700207dee6"),
      ],
    },
    featured: true,
  },
  {
    slug: "torba-hillside-villa",
    type: "villa",
    status: "satilik",
    region: "torba",
    price: 2100000,
    currency: "EUR",
    specs: { areaGross: 290, areaNet: 260, bedrooms: 4, bathrooms: 4, yearBuilt: 2018, plotSize: 900 },
    features: ["sea_view", "pool", "garden", "parking", "fireplace"],
    translations: makeTranslations({
      tr: {
        title: "Torba Yamaç Villası",
        description: "Torba'nın sessiz bir koyunda, aile yaşamına uygun geniş planlı bir villa.",
        highlights: ["Family layout", "Quiet cove", "Short drive to Bodrum"],
      },
      en: {
        title: "Torba Hillside Villa",
        description: "In a quiet cove of Torba, a spacious villa ideal for family living.",
        highlights: ["Family layout", "Quiet cove", "Short drive to Bodrum"],
      },
      de: {
        title: "Hanglage-Villa in Torba",
        description: "In einer ruhigen Bucht von Torba, ideale Villa fürs Familienleben.",
        highlights: ["Familiengrundriss", "Ruhige Bucht", "Kurz zum Zentrum"],
      },
      ru: {
        title: "Вилла на склоне в Торбе",
        description: "В тихой бухте Торбы, просторная вилла для семейного проживания.",
        highlights: ["Семейная планировка", "Тихая бухта", "Близко к центру"],
      },
    }),
    media: {
      cover: img("1519046904884-53103b34b206"),
      gallery: [
        img("1519046904884-53103b34b206"),
        img("1613977257363-707ba9348227"),
        img("1600566753376-12c8ab7fb75b"),
      ],
    },
  },
  {
    slug: "bodrum-center-loft",
    type: "rezidans",
    status: "satilik",
    region: "bodrumMerkez",
    price: 720000,
    currency: "EUR",
    specs: { areaGross: 120, areaNet: 105, bedrooms: 2, bathrooms: 2, yearBuilt: 2022 },
    features: ["sea_view", "smart_home", "parking", "security", "elevator", "air_conditioning", "furnished"],
    translations: makeTranslations({
      tr: {
        title: "Bodrum Merkez Loft Rezidans",
        description: "Bodrum kalesinin hemen yanında, marinaya yürüme mesafesinde bir loft rezidans.",
        highlights: ["Walk to marina", "Smart home", "Corner views"],
      },
      en: {
        title: "Loft Residence in Bodrum Center",
        description: "A loft residence next to the castle, walking distance to the marina.",
        highlights: ["Walk to marina", "Smart home", "Corner views"],
      },
      de: {
        title: "Loft-Residenz im Zentrum von Bodrum",
        description: "Loft-Residenz neben der Burg, fußläufig zum Hafen.",
        highlights: ["Zu Fuß zum Hafen", "Smart Home", "Eckblicke"],
      },
      ru: {
        title: "Лофт-резиденция в центре Бодрума",
        description: "Лофт рядом с крепостью, в пешей доступности от марины.",
        highlights: ["Рядом марина", "Умный дом", "Угловые виды"],
      },
    }),
    media: {
      cover: img("1520454974749-611b7248ffdb"),
      gallery: [img("1520454974749-611b7248ffdb"), img("1613977257363-707ba9348227")],
    },
  },
];

async function run() {
  console.log(`Seeding ${SEED_PROPERTIES.length} properties...`);
  const now = Timestamp.now();

  for (const p of SEED_PROPERTIES) {
    const existing = await db
      .collection("properties")
      .where("slug", "==", p.slug)
      .limit(1)
      .get();
    if (!existing.empty) {
      console.log(` - skip (exists): ${p.slug}`);
      continue;
    }
    await db.collection("properties").add({
      ...p,
      createdAt: now,
      updatedAt: now,
    });
    console.log(` + added: ${p.slug}`);
  }

  console.log("Done.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
