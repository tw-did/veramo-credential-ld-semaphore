import { Identity } from '@semaphore-protocol/identity';
import { SEMAPHORE_KMS, getAgent } from './veramo/setup.js';
import {
  SEMAPHORE_CONTEXT_URI,
  SEMAPHORE_HIDDEN_PUBLIC_KEY,
  SEMAPHORE_TYPE,
} from './libs/index.js';
import { CredentialPayload } from '@veramo/core';

async function main() {
  const agent = await getAgent();

  // create mock sempahore identity
  const identity = new Identity('TOP-SECRET-KEY');

  // import the identity but use hidden publicKeyHex
  const holder = await agent.didManagerImport({
    did: 'did:web:tw-did.github.io:hidden',
    provider: 'did:web',
    keys: [
      {
        kid: 'default',
        kms: SEMAPHORE_KMS,
        type: SEMAPHORE_TYPE,
        privateKeyHex: identity.toString(),
        publicKeyHex: SEMAPHORE_HIDDEN_PUBLIC_KEY,
      },
    ],
  });

  // create an unsigned credential
  const credential: CredentialPayload = {
    '@context': [SEMAPHORE_CONTEXT_URI],
    issuer: holder.did,
    credentialSubject: {
      group: '1',
    },
  };

  // set proofFormat to lds to use credential-ld to
  // create Verifiable Credential.
  const verifiableCredential = await agent.createVerifiableCredential({
    credential,
    proofFormat: 'lds',
  });

  console.log('# Semaphore Verifiable Credential');
  console.log(verifiableCredential, '\n');

  // Verify the credential via veramo agent and credential-ld
  const verified = await agent.verifyCredential({
    credential: verifiableCredential,
  });

  console.log('# Verification result');
  console.log(verified, '\n');
}

main().then(() => process.exit(0));
