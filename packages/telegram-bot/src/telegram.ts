import { Telegraf } from "telegraf";

const { TELEGRAM_TOKEN } = process.env;

export function setupTelegram() {
  if (!TELEGRAM_TOKEN) {
    throw new Error("No TELEGRAM_TOKEN provided");
  }

  const telegram = new Telegraf(TELEGRAM_TOKEN);

  // telegram.start((ctx) => ctx.reply("Welcome"));
  // telegram.help((ctx) => ctx.reply("Send me a sticker"));

  telegram.launch();

  return telegram;
}
