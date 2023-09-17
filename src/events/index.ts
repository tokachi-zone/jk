import { Client } from "discord.js";

import asakatsu from "./asakatsu";

export interface Event {
  callback: (client: Client, activeGuild: string) => Promise<void>;
};

export default [asakatsu];
