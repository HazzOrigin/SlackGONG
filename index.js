import { WebClient } from "@slack/web-api";

const token = process.env.SLACK_BOT_TOKEN;
const channel = process.env.CHANNEL_ID;
const gongUrl = process.env.GONG_MP3_URL || "https://www.myinstants.com//media/sounds/asian-gong.mp3";

// Optional deal fields
const owner = process.env.OWNER || "<@U123ABC>";
const account = process.env.ACCOUNT || "Acme Corp";
const amount = process.env.AMOUNT || "$125,000";

if (!token || !channel) {
  console.error("Missing SLACK_BOT_TOKEN or CHANNEL_ID");
  process.exit(1);
}

const slack = new WebClient(token);

const blocks = [
  { type: "header", text: { type: "plain_text", text: "🎉 GONG! New Win Closed! 🛎️", emoji: true } },
  { type: "section", text: { type: "mrkdwn", text: `*Owner:* ${owner}\n*Account:* ${account}\n*Amount:* ${amount}\n*Stage:* Closed Won` } },
  { type: "image", image_url: "https://media.giphy.com/media/xT1XGNBg3a6Z2MZQY8/giphy.gif", alt_text: "Gong GIF" }
];

async function run() {
  const post = await slack.chat.postMessage({ channel, text: "GONG! New Win Closed!", blocks });
  const thread_ts = post.ts;

  const res = await fetch(gongUrl);
  if (!res.ok) throw new Error(`Failed mp3 fetch: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());

  if (slack.files.uploadV2) {
    await slack.files.uploadV2({ channel_id: channel, thread_ts, initial_comment: "Hit it! 🛎️", filename: "gong.mp3", file: buf });
  } else {
    await slack.files.upload({ channels: channel, thread_ts, initial_comment: "Hit it! 🛎️", filename: "gong.mp3", file: buf });
  }
}
run().catch(err => { console.error(err); process.exit(1); });
