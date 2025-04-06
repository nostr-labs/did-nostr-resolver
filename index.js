/**
 * did-nostr-resolver
 * Library to work with Nostr Decentralized Identifiers (DIDs)
 * 
 * @license MIT
 */

/**
 * Validates if a string is a valid 64-character hex Nostr public key
 * @param {string} pubkey - The public key to validate
 * @returns {boolean} - Whether the pubkey is valid
 */
function isValidNostrPubkey (pubkey) {
  return typeof pubkey === 'string' &&
    /^[0-9a-f]{64}$/.test(pubkey);
}

/**
 * Converts an npub (Bech32 encoded) to a hex public key
 * @param {string} npub - The npub to convert
 * @returns {string|null} - The hex public key or null if invalid
 */
function npubToHex (npub) {
  // This is a placeholder. In a real implementation, 
  // you would need a Bech32 library to decode the npub
  // For example, using 'nostr-tools' or other libraries

  // For demonstration purposes, we're just checking the format
  if (typeof npub === 'string' && npub.startsWith('npub1') && npub.length >= 60) {
    console.warn('Real npub conversion requires a Bech32 library');
    return null;
  }
  return null;
}

/**
 * Creates a DID-Nostr identifier from a Nostr public key
 * @param {string} pubkey - The Nostr public key (64-character hex)
 * @returns {string|null} - The DID identifier or null if invalid
 */
function createDidNostr (pubkey) {
  // Support for npub format (partial implementation)
  if (pubkey.startsWith('npub1')) {
    const hexPubkey = npubToHex(pubkey);
    if (!hexPubkey) {
      console.error('Invalid or unsupported npub format');
      return null;
    }
    pubkey = hexPubkey;
  }

  if (!isValidNostrPubkey(pubkey)) {
    console.error('Invalid Nostr public key format');
    return null;
  }

  return `did:nostr:${pubkey}`;
}

/**
 * Creates a complete DID Document for a Nostr public key
 * @param {string} pubkey - The Nostr public key (64-character hex)
 * @param {object} [options] - Additional options
 * @param {string[]} [options.relays] - Array of relay URLs to include in the service section
 * @returns {object|null} - The DID Document or null if invalid
 */
function createDidNostrDocument (pubkey, options = {}) {
  // Support for npub format (partial implementation)
  if (pubkey.startsWith('npub1')) {
    const hexPubkey = npubToHex(pubkey);
    if (!hexPubkey) {
      console.error('Invalid or unsupported npub format');
      return null;
    }
    pubkey = hexPubkey;
  }

  if (!isValidNostrPubkey(pubkey)) {
    console.error('Invalid Nostr public key format');
    return null;
  }

  const did = createDidNostr(pubkey);

  const didDocument = {
    "@context": ["https://w3id.org/did/v1", "https://w3id.org/nostr/v1"],
    "id": did,
    "publicKey": [
      {
        "id": `${did}#key1`,
        "controller": did,
        "type": "SchnorrVerification2023",
        "publicKeyHex": pubkey
      }
    ],
    "authentication": [`${did}#key1`],
    "assertionMethod": [`${did}#key1`]
  };

  // Add relay services if provided
  if (options.relays && Array.isArray(options.relays) && options.relays.length > 0) {
    didDocument.service = options.relays.map((relay, index) => ({
      "id": `${did}#relay${index + 1}`,
      "type": "NostrRelay",
      "serviceEndpoint": relay
    }));
  }

  return didDocument;
}

/**
 * Resolves a DID-Nostr identifier to its DID Document
 * @param {string} did - The DID-Nostr identifier
 * @param {object} [options] - Additional options
 * @param {string[]} [options.relays] - Array of relay URLs to include in the service section
 * @returns {object|null} - The resolved DID Document or null if invalid
 */
function resolveDidNostr (did, options = {}) {
  if (!did || typeof did !== 'string') {
    console.error('Invalid DID provided');
    return null;
  }

  // Check if the DID matches the expected format
  const didMatch = did.match(/^did:nostr:([0-9a-f]{64})$/);
  if (!didMatch) {
    console.error('Invalid DID-Nostr format');
    return null;
  }

  const pubkey = didMatch[1];
  return createDidNostrDocument(pubkey, options);
}

module.exports = {
  isValidNostrPubkey,
  npubToHex,
  createDidNostr,
  createDidNostrDocument,
  resolveDidNostr
}; 