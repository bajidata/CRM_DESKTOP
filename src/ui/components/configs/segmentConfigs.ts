// configs/segmentConfigs.ts
export const segmentConfigs: Record<
  string,
  { type: "text" | "date" | "select"; options?: string[] }
> = {
  start_date: { type: "date" },
  end_date: { type: "date" },
  game_type: {
    type: "select",
    options: [
      "TIP",
      "CRASH",
      "OTHERS",
      "RAIN",
      "ARCADE",
      "SLOT",
      "Sport",
      "ESport",
      "P2P",
      "LOTTERY",
      "TABLE",
      "NoValue",
      "FREE",
      "FH",
      "CARD",
      "CASINO",
      "COCK_FIGHTING",
    ],
  },
  currency: { type: "select", options: ["BDT", "PKR", "INR"] },
  brand: { type: "select", options: ["bj", "jb", "s6"] },
};
