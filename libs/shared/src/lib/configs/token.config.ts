import { registerAs } from '@nestjs/config';

export default registerAs('tokens', () => ({
  graphqlUrl: process.env.GRAPHQL_URL || 'https://app.tribe.so/graphql',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  signingSecret: process.env.SIGNING_SECRET,
  networkId: process.env.NETWORK_ID,
  memberId: process.env.MEMBER_ID || '',
}));
