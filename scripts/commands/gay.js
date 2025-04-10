const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GRAPH_API_BASE = 'https://graph.facebook.com';
const FB_HARDCODED_TOKEN = '6628568379|c1e620fa708a1d5696fb991c1bde5662';
const GAY_API_URL = 'https://nexalo-api.vercel.app/api/gay';

module.exports.config = {
  name: "gay",
  aliases: [],
  version: "1.0",
  author: "Hridoy",
  countDown: 5,
  adminOnly: false,
  description: "Expose someone as a certified gay 😭",
  category: "Fun",
  guide: "{pn} gay @user",
  usePrefix: true
};

function getProfilePictureURL(userID, size = [512, 512]) {
  const [height, width] = size;
  return `${GRAPH_API_BASE}/${userID}/picture?width=${width}&height=${height}&access_token=${FB_HARDCODED_TOKEN}`;
}

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, mentions } = event;

  try {
    const mentionIDs = Object.keys(mentions);
    if (mentionIDs.length === 0) {
      return api.sendMessage("Bro tag someone to call out 😭", threadID, messageID);
    }

    const targetID = mentionIDs[0];
    const targetName = mentions[targetID];

    const imageURL = getProfilePictureURL(targetID);

    const response = await axios.get(GAY_API_URL, {
      params: {
        imageurl: imageURL,
      },
      timeout: 10000
    });

    if (response.data && response.data.status) {
      const gayImageURL = response.data.url;

      const fileName = `gay_${path.basename(gayImageURL)}`;
      const filePath = path.join(__dirname, fileName);

      const imageResponse = await axios.get(gayImageURL, {
        responseType: 'stream',
        timeout: 10000
      });

      const writer = fs.createWriteStream(filePath);

      imageResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const msg = {
        body: `🌈 Look I found a certified gay: ${targetName} 😂`,
        attachment: fs.createReadStream(filePath),
        mentions: [
          {
            tag: targetName,
            id: targetID
          }
        ]
      };

      api.sendMessage(msg, threadID, (err) => {
        if (err) {
          console.error("❌ Error sending image:", err);
          api.sendMessage("❌", threadID, messageID);
        }

        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("❌ Error deleting image file:", unlinkErr);
        });
      });

    } else {
      console.error("❌ Unexpected API response:", response.data);
      api.sendMessage("❌ Failed to process the image.", threadID, messageID);
    }

  } catch (error) {
    console.error("❌ Error in gay command:", error.message);
    api.sendMessage("❌ An error occurred while processing your request.", threadID, messageID);
  }
};