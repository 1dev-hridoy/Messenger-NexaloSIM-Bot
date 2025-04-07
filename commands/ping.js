const chalk = require('chalk');

module.exports.config = {
  name: "ping",
  aliases: ["pong", "latency"],
  version: "1.0",
  author: "YourName", // Replace with your name
  countDown: 5,
  adminOnly: false,
  description: "Check the bot's response time",
  category: "Utility",
  guide: "{pn}",
  usePrefix: true
};

module.exports.run = async function({ api, event, args, config }) {
  const { threadID, messageID, timestamp } = event;

  try {
    // Set "processing" reaction
    api.setMessageReaction("🕥", messageID, () => {}, true);

    // Calculate latency (current time - message timestamp)
    const startTime = timestamp;
    const endTime = Date.now();
    const latency = endTime - startTime;

    // Send response with latency
    const response = `Pong! Latency: ${latency}ms`;
    api.sendMessage(response, threadID, () => {
      // Set "success" reaction after sending
      api.setMessageReaction("✅", messageID, () => {}, true);
    }, messageID);

    // Log the command usage
    console.log(chalk.cyan(`[Ping Command] Latency: ${latency}ms | ThreadID: ${threadID}`));
  } catch (error) {
    // Set "failure" reaction on error
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage("An error occurred while processing the ping command.", threadID, messageID);
    console.log(chalk.red(`[Ping Error] ${error.message}`));
  }
};