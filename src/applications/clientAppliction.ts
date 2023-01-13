import { ConfidentialClientApplication, LogLevel } from '@azure/msal-node';
import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  auth: {
    clientId: process.env.OAUTH_APP_ID,
    authority: process.env.OAUTH_AUTHORITY,
    clientSecret: process.env.OAUTH_APP_CLIENT_SECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose || 3,
    },
  },
};

const clientApplication = new ConfidentialClientApplication(config);

export default clientApplication;
