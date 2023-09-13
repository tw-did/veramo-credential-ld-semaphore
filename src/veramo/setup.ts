import {
  createAgent,
  ICredentialPlugin,
  IDIDManager,
  IResolver,
  TAgent,
} from '@veramo/core';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { Resolver } from 'did-resolver';
import { WebDIDProvider } from '@veramo/did-provider-web';
import { KeyManager, MemoryPrivateKeyStore } from '@veramo/key-manager';
import { KeyStoreJson } from '@veramo/data-store-json';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { getResolver as getWebResolver } from 'web-did-resolver';
import {
  LdDefaultContexts,
  CredentialIssuerLD,
  VeramoLdSignature,
} from '@veramo/credential-ld';
import {
  SEMAPHORE_EXTRA_CONTEXTS,
  SemaphoreKeyManagementSystem,
  SemaphoreSignature2023,
} from '../libs/index.js';

type InstalledPlugins = IResolver & IDIDManager & ICredentialPlugin;

export const WEB_DID_PROVIDER = 'did:web';
export const SEMAPHORE_KMS = 'semaphore';

export async function getAgent(): Promise<TAgent<InstalledPlugins>> {
  const suites: VeramoLdSignature[] = [new SemaphoreSignature2023()];
  const memoryJsonStore = {
    notifyUpdate: () => Promise.resolve(),
  };
  const contextMaps = [LdDefaultContexts, SEMAPHORE_EXTRA_CONTEXTS];

  return createAgent<InstalledPlugins>({
    plugins: [
      new KeyManager({
        store: new KeyStoreJson(memoryJsonStore),
        kms: {
          [SEMAPHORE_KMS]: new SemaphoreKeyManagementSystem(
            new MemoryPrivateKeyStore()
          ),
        },
      }),
      new DIDManager({
        store: new MemoryDIDStore(),
        defaultProvider: WEB_DID_PROVIDER,
        providers: {
          [WEB_DID_PROVIDER]: new WebDIDProvider({
            defaultKms: SEMAPHORE_KMS,
          }),
        },
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...getWebResolver(),
        }),
      }),
      new CredentialPlugin(),
      new CredentialIssuerLD({ suites, contextMaps }),
    ],
  });
}
