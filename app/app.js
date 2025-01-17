const express = require("express");

const config = require("./config");
const OauthClient = require("./oauth/client.js");
const CharacterService = require("./services/CharacterService");
const SignatureService = require("./services/SignatureService");
const cors = require("cors")

const oauthOptions = {
  client: {
      id: process.env.CLIENT_ID,
      secret: process.env.CLIENT_SECRET
  },
  auth: {
      tokenHost: process.env.OAUTH_TOKEN_HOST || "https://us.battle.net"
  }
};

const oauthClient = new OauthClient({ oauthOptions });
const characterService = new CharacterService(oauthClient, config);
const signatureService = new SignatureService(config);
let token = null

const app = express();
app.use(cors())

app.get("/", async (req, res, next) => {
  res.json({
    status: 200,
    message: token
  })
});

app.get("/signature", async (req, res, next) => {
  try {
    const { characterName, realmName, region } = req.query;
    const character = await characterService.getCharacter(region, realmName, characterName);
    const characterMedia = await characterService.getCharacterMedia(character);
    const { filename, data } = await signatureService.generateImage(character, characterMedia);
    res.set("Content-Type", "image/png");
    res.set("Content-Disposition", `inline; filename="${filename}"`);
    res.send(data);
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Internal Service Error");
});

module.exports = async () => {
  token = await oauthClient.getToken();
  return app;
};