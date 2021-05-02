const oauth2 = require("simple-oauth2");
let token = ""
class OAuthClient {
    
    constructor({
        oauthOptions
    }) {
        this.client = oauth2.create(oauthOptions);
        this.token = null;
    }

    async getToken() {
        try {
            if (this.token === null || this.token.expired()) {
                const token = await this.client.clientCredentials.getToken();
                this.token = this.client.accessToken.create(token);
            }
            token = this._reduceToken(this.token)
            
            return token;
        } catch (err) {
            console.error(`Failed to retrieve client credentials oauth token: ${err.message}`);
            throw err;
        }
    }

    _reduceToken(token) {
        return token.token.access_token;;
    }
}

module.exports = OAuthClient;
