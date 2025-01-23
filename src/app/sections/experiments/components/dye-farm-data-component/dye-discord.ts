import { isDevMode } from '@angular/core';
import { generateCodeVerifier, OAuth2Client } from '@badgateway/oauth2-client';

// Discord App Config
const CLIENT_ID = '1305489473550815232';
const REDIRECT_URI = isDevMode()
  ? 'http://localhost:8788/experiment/dye'
  : 'https://sky-planner.com/experiment/dye';
const DISCORD_AUTH_URL = 'https://discord.com/api/oauth2/authorize';
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';

const client = new OAuth2Client({
  clientId: CLIENT_ID,
  authorizationEndpoint: DISCORD_AUTH_URL,
  tokenEndpoint: DISCORD_TOKEN_URL,
});

// Login button click handler
export const authenticate = async () => {
    const codeVerifier = await generateCodeVerifier();
    localStorage.setItem('dsc-codeVerifier', codeVerifier);

    const uri = await client.authorizationCode.getAuthorizeUri({
      redirectUri: REDIRECT_URI,
      scope: ['identify'],
      codeVerifier
    });
    const url = new URL(uri);
    window.location.href = url.toString();
};

// After redirect, exchange the code for a token
export const handleRedirect = async (code: string): Promise<string|undefined> => {
  const codeVerifier = localStorage.getItem('dsc-codeVerifier');
  if (!codeVerifier) {
    alert('Code verifier not found. Please restart the login process.');
    return;
  }

  const token = await client.authorizationCode.getToken({
    code,
    redirectUri: REDIRECT_URI,
    codeVerifier
  });

  return token.accessToken;
}
