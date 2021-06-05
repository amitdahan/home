import { Markup, Telegraf, Telegram, Types } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";
import { setupSonarr } from "./sonarr";
import { setupTelegram } from "./telegram";

interface Choice {
  text: string;
  data: string;
}

interface Command {
  getLoadingText?(arg: string): string;
  getLoadedText(arg: string, choices: Choice[]): string;
  getChoices(arg: string): Promise<Choice[]>;
}

function setupCommands(
  telegram: Telegraf,
  commands: Record<string, Command>
): void {
  Object.keys(commands).forEach((command) => {
    telegram.command(command, async (ctx) => {
      const {
        getLoadingText = () => `Loading...`,
        getLoadedText,
        getChoices,
      } = commands[command];

      const arg = ctx.message.text.replace(`/${command} `, "");

      const [message, choices] = await Promise.all([
        ctx.replyWithMarkdown(getLoadingText(arg)),
        getChoices(arg),
      ]);

      ctx.telegram.editMessageText(
        ctx.chat.id,
        message.message_id,
        ctx.inlineMessageId,
        getLoadedText(arg, choices),
        {
          parse_mode: "Markdown",
          ...Markup.inlineKeyboard(
            choices.map(({ text, data }) => [
              Markup.button.callback(text, data),
            ])
          ),
        }
      );
    });
  });
}

function init() {
  const telegram = setupTelegram();
  const sonarr = setupSonarr();
  // const radarr = setupRadarr();

  setupCommands(telegram, {
    tv: {
      getLoadingText: (searchTerm) => `Searching for *${searchTerm}*...`,
      getLoadedText: (searchTerm, choices) =>
        `Results for *${searchTerm}*: (${choices.length})`,
      async getChoices(searchTerm) {
        const results = await sonarr.search(searchTerm);
        return results.slice(0, 10).map((series) => ({
          data: `${series.tvdbId}`,
          text: `${series.title} (${series.year})`,
        }));
      },
    },
  });

  telegram.action(/.+/, (ctx) => {
    return ctx.answerCbQuery(`Oh, ${ctx.match[0]}! Great choice`);
  });

  // Enable graceful stop
  process.once("SIGINT", () => telegram.stop("SIGINT"));
  process.once("SIGTERM", () => telegram.stop("SIGTERM"));
  process.once("SIGUSR2", () => telegram.stop("SIGUSR2"));
}

init();
