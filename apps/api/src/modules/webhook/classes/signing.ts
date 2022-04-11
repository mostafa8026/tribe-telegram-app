import * as crypto from 'crypto';

const MILLISECONDS_IN_MINUTE = 1000 * 60;

export const getSignature = (options: {
  secret: string;
  body: string;
  timestamp: number;
}): string => {
  const { secret, body, timestamp } = options;
  return crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}:${body}`)
    .digest('hex');
};

export const verifySignature = (options: {
  signature: string;
  secret: string;
  body: string;
  timestamp: number;
}): boolean => {
  console.log('options: ', options);
  const { signature, secret, body, timestamp } = options;
  const timeDifference =
    (timestamp - new Date().getTime()) / MILLISECONDS_IN_MINUTE;
  console.log('timeDifference: ', timeDifference);
  if (timeDifference > 5) return false;
  const hash = getSignature({ secret, body, timestamp });
  console.log('hash: ', hash);
  const isVerified = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hash)
  );
  console.log('isVerified: ', isVerified);
  return isVerified;
};
