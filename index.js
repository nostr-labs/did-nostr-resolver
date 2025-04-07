/**
 * did-nostr-resolver
 * Library to work with Nostr Decentralized Identifiers (DIDs)
 * 
 * @license MIT
 */

// Wrap everything in an IIFE to avoid global scope pollution
(function () {

  /**
   * Validates if a string is a valid 64-character hex Nostr public key
   * @param {string} pubkey - The public key to validate
   * @returns {boolean} - Whether the pubkey is valid
   */
  function isValidNostrPubkey (pubkey) {
    return typeof pubkey === 'string' &&
      /^[0-9a-f]{64}$/i.test(pubkey);
  }

  /**
   * More flexible validation for pubkeys (supports npub format)
   * @param {string} pubkey - The public key to validate (hex or npub)
   * @returns {boolean} - Whether the pubkey is valid
   */
  function isValidPubkey (pubkey) {
    try {
      // Check if it's a hex pubkey
      if (/^[0-9a-f]{64}$/i.test(pubkey)) {
        return true;
      }

      // Check if it's an npub and can be converted to hex
      if (pubkey.startsWith('npub1')) {
        // In browsers, NostrTools would be available globally
        // In Node.js, we would need to check for its availability
        if (typeof NostrTools !== 'undefined' && NostrTools.nip19) {
          try {
            return NostrTools.nip19.decode(pubkey).type === 'npub';
          } catch (e) {
            return false;
          }
        } else {
          // Basic format check when NostrTools is not available
          return pubkey.length >= 60;
        }
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Normalizes a public key to hex format
   * @param {string} pubkey - The public key (hex or npub)
   * @returns {string} - The normalized hex public key
   */
  function normalizePublicKey (pubkey) {
    if (pubkey.startsWith('npub1')) {
      // In browsers, NostrTools would be available globally
      if (typeof NostrTools !== 'undefined' && NostrTools.nip19) {
        try {
          return NostrTools.nip19.decode(pubkey).data;
        } catch (e) {
          throw new Error('Invalid npub format');
        }
      } else {
        // Fallback to our basic implementation
        const hexPubkey = npubToHex(pubkey);
        if (!hexPubkey) {
          throw new Error('Invalid npub format');
        }
        return hexPubkey;
      }
    }
    return pubkey;
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

    // Try to use NostrTools if available (browser environment)
    if (typeof NostrTools !== 'undefined' && NostrTools.nip19) {
      try {
        return NostrTools.nip19.decode(npub).data;
      } catch (e) {
        console.warn('Error decoding npub:', e);
        return null;
      }
    }

    // For demonstration purposes, we're just checking the format
    if (typeof npub === 'string' && npub.startsWith('npub1') && npub.length >= 60) {
      console.warn('Real npub conversion requires a Bech32 library');
      return null;
    }
    return null;
  }

  /**
   * Creates a DID-Nostr identifier from a Nostr public key
   * @param {string} pubkey - The Nostr public key (64-character hex or npub)
   * @returns {string|null} - The DID identifier or null if invalid
   */
  function createDidNostr (pubkey) {
    // Support for npub format
    if (pubkey.startsWith('npub1')) {
      try {
        pubkey = normalizePublicKey(pubkey);
      } catch (e) {
        console.error('Invalid or unsupported npub format');
        return null;
      }
    }

    if (!isValidNostrPubkey(pubkey)) {
      console.error('Invalid Nostr public key format');
      return null;
    }

    return `did:nostr:${pubkey}`;
  }

  /**
   * Creates a complete DID Document for a Nostr public key
   * @param {string} pubkey - The Nostr public key (64-character hex or npub)
   * @param {object} [options] - Additional options
   * @param {string[]} [options.relays] - Array of relay URLs to include in the service section
   * @param {string} [options.website] - Website URL to include in the service section
   * @param {string[]} [options.storage] - Storage endpoints to include in the service section
   * @returns {Promise<object|null>} - The DID Document or null if invalid
   */
  async function createDidNostrDocument (pubkey, options = {}) {
    // Support for npub format
    if (pubkey.startsWith('npub1')) {
      try {
        pubkey = normalizePublicKey(pubkey);
      } catch (e) {
        console.error('Invalid or unsupported npub format');
        return null;
      }
    }

    if (!isValidNostrPubkey(pubkey)) {
      console.error('Invalid Nostr public key format');
      return null;
    }

    const did = createDidNostr(pubkey);

    const didDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/nostr/context'
      ],
      id: did,
      verificationMethod: [
        {
          id: `${did}#key1`,
          controller: did,
          type: 'SchnorrVerification2023'
        }
      ],
      authentication: ['#key1'],
      assertionMethod: ['#key1']
    };

    // Add services if provided
    const services = [];

    // Add relay services if provided
    if (options.relays && Array.isArray(options.relays) && options.relays.length > 0) {
      options.relays.forEach((relay, index) => {
        services.push({
          id: `${did}#relay${index + 1}`,
          type: 'Relay',
          serviceEndpoint: relay
        });
      });
    }

    // Add website from profile if available
    if (options.website) {
      services.push({
        id: `${did}#website`,
        type: ['Website', 'LinkedDomains'],
        serviceEndpoint: options.website
      });
    }

    // Add storage endpoints from profile if available
    if (options.storage && Array.isArray(options.storage) && options.storage.length > 0) {
      options.storage.forEach((endpoint, index) => {
        services.push({
          id: `${did}#storage${index + 1}`,
          type: 'Storage',
          serviceEndpoint: endpoint
        });
      });
    }

    // Only add services array if there are services
    if (services.length > 0) {
      didDocument.service = services;
    }

    return didDocument;
  }

  /**
   * Resolves a DID-Nostr identifier to its DID Document
   * @param {string} did - The DID-Nostr identifier
   * @param {object} [options] - Additional options
   * @param {string[]} [options.relays] - Array of relay URLs to include in the service section
   * @param {string} [options.website] - Website URL to include in the service section
   * @param {string[]} [options.storage] - Storage endpoints to include in the service section
   * @returns {Promise<object|null>} - The resolved DID Document or null if invalid
   */
  async function resolveDidNostr (did, options = {}) {
    if (!did || typeof did !== 'string') {
      console.error('Invalid DID provided');
      return null;
    }

    // Check if the DID matches the expected format
    const didMatch = did.match(/^did:nostr:([0-9a-f]{64})$/i);
    if (!didMatch) {
      console.error('Invalid DID-Nostr format');
      return null;
    }

    const pubkey = didMatch[1];
    return createDidNostrDocument(pubkey, options);
  }

  /**
   * Fetch relays for a Nostr public key
   * @param {string} pubkey - The Nostr public key (hex or npub)
   * @returns {Promise<string[]>} - Array of relay URLs
   */
  async function fetchRelaysForPubkey (pubkey) {
    if (!isValidPubkey(pubkey)) {
      throw new Error('Invalid public key format');
    }

    const hexPubkey = normalizePublicKey(pubkey);
    console.log('Fetching relay list for pubkey:', hexPubkey);

    // Create a filter for kind 10002 (relay list metadata) events
    const filter = {
      kinds: [10002],
      authors: [hexPubkey],
      limit: 1
    };

    // Default relays to try
    const defaultRelays = [
      'wss://relay.damus.io',
      'wss://nos.lol',
      'wss://ditto.pub/relay',
      'wss://relay.nostr.band',
      'wss://nostr.bitcoiner.social'
    ];

    try {
      console.log('Using WebSocket approach to fetch relay list');

      // Function to get kind 10002 events via WebSocket
      const getViaWebSocket = relayUrl => {
        return new Promise(resolve => {
          try {
            // Check if we're in a Node.js environment and use the ws package if needed
            let ws;
            let isNodeWs = false;

            if (typeof WebSocket !== 'undefined') {
              // Browser environment
              ws = new WebSocket(relayUrl);
            } else if (typeof require !== 'undefined') {
              // Node.js environment
              try {
                const WebSocketNode = require('ws');
                ws = new WebSocketNode(relayUrl);
                isNodeWs = true;
              } catch (wsError) {
                console.log('Failed to require ws package:', wsError.message);
                resolve(null);
                return;
              }
            } else {
              console.log('No WebSocket implementation available');
              resolve(null);
              return;
            }

            let timeoutId = setTimeout(() => {
              console.log(`WebSocket timeout for ${relayUrl}`);
              ws.close();
              resolve(null);
            }, 5000);

            const handleOpen = () => {
              console.log(`WebSocket connected to ${relayUrl}`);
              const reqId = Math.random().toString(36).substring(7);
              ws.send(JSON.stringify(['REQ', reqId, filter]));
            };

            const handleMessage = (event) => {
              try {
                // Handle different event data format between browser and Node.js
                const rawData = isNodeWs ? event : event.data;
                const data = JSON.parse(rawData);

                if (
                  data[0] === 'EVENT' &&
                  data[2].kind === 10002 &&
                  data[2].pubkey === hexPubkey
                ) {
                  console.log(`Got event from ${relayUrl}:`, data[2]);
                  clearTimeout(timeoutId);
                  ws.close();
                  resolve(data[2]);
                } else if (data[0] === 'EOSE') {
                  console.log(`End of stored events from ${relayUrl}`);
                  clearTimeout(timeoutId);
                  ws.close();
                  resolve(null);
                }
              } catch (e) {
                console.log(`Error parsing WebSocket message:`, e);
              }
            };

            const handleError = (error) => {
              console.log(`WebSocket error for ${relayUrl}:`, error ? error.message : 'Unknown error');
              clearTimeout(timeoutId);
              ws.close();
              resolve(null);
            };

            const handleClose = () => {
              clearTimeout(timeoutId);
              resolve(null);
            };

            // Set up event handlers based on environment
            if (isNodeWs) {
              // Node.js ws package event handling
              ws.on('open', handleOpen);
              ws.on('message', handleMessage);
              ws.on('error', handleError);
              ws.on('close', handleClose);
            } else {
              // Browser WebSocket event handling
              ws.onopen = handleOpen;
              ws.onmessage = handleMessage;
              ws.onerror = handleError;
              ws.onclose = handleClose;
            }
          } catch (e) {
            console.log(`Error creating WebSocket:`, e);
            resolve(null);
          }
        });
      };

      // Create WebSocket promises for all default relays
      const fetchPromises = defaultRelays.map(relayUrl =>
        getViaWebSocket(relayUrl)
      );

      // Wait for all promises and collect results
      const results = await Promise.all(fetchPromises);
      const event = results.find(result => result !== null);

      if (event) {
        try {
          let relayUrls = [];

          // Extract relays from tags array with 'r' prefix
          if (event.tags && Array.isArray(event.tags)) {
            relayUrls = event.tags
              .filter(tag => tag.length >= 2 && tag[0] === 'r')
              .map(tag => tag[1])
              .filter(
                url =>
                  url &&
                  (url.startsWith('wss://') || url.startsWith('ws://'))
              );
          }

          // Fall back to content parsing if tags didn't yield any results
          if (
            relayUrls.length === 0 &&
            event.content &&
            event.content.trim() !== ''
          ) {
            try {
              const relayList = JSON.parse(event.content);
              relayUrls = Object.keys(relayList);
            } catch (e) {
              console.log(
                'Content not valid JSON, ignoring content field'
              );
            }
          }

          if (relayUrls && relayUrls.length > 0) {
            console.log('Found relay list:', relayUrls);
            return relayUrls;
          } else {
            console.log('No relay URLs found in event');
          }
        } catch (e) {
          console.log('Error extracting relay information:', e);
        }
      }

      // If we get here, no relays were found
      console.log('No relay list found');
      return [];
    } catch (e) {
      console.error('Error in fetchRelaysForPubkey:', e);
      // Return empty array instead of throwing to avoid UI errors
      return [];
    }
  }

  /**
   * Fetch profile information for a Nostr public key
   * @param {string} pubkey - The Nostr public key (hex or npub)
   * @returns {Promise<object|null>} - Profile data or null if not found
   */
  async function fetchProfileForPubkey (pubkey) {
    if (!isValidPubkey(pubkey)) {
      throw new Error('Invalid public key format');
    }

    const hexPubkey = normalizePublicKey(pubkey);
    console.log('Fetching profile for pubkey:', hexPubkey);

    // Create a filter for kind 0 (profile metadata) events
    const filter = {
      kinds: [0],
      authors: [hexPubkey],
      limit: 1
    };

    // Default relays to try
    const defaultRelays = [
      'wss://relay.damus.io',
      'wss://nos.lol',
      'wss://ditto.pub/relay',
      'wss://relay.nostr.band',
      'wss://nostr.bitcoiner.social'
    ];

    try {
      console.log('Using WebSocket approach to fetch profile');

      // Function to get kind 0 events via WebSocket
      const getProfileViaWebSocket = relayUrl => {
        return new Promise(resolve => {
          try {
            // Check if we're in a Node.js environment and use the ws package if needed
            let ws;
            let isNodeWs = false;

            if (typeof WebSocket !== 'undefined') {
              // Browser environment
              ws = new WebSocket(relayUrl);
            } else if (typeof require !== 'undefined') {
              // Node.js environment
              const WebSocketNode = require('ws');
              ws = new WebSocketNode(relayUrl);
              isNodeWs = true;
            } else {
              console.log('No WebSocket implementation available');
              resolve(null);
              return;
            }

            let timeoutId = setTimeout(() => {
              console.log(`WebSocket timeout for profile fetch from ${relayUrl}`);
              ws.close();
              resolve(null);
            }, 5000);

            const handleOpen = () => {
              console.log(`WebSocket connected to ${relayUrl} for profile fetch`);
              const reqId = Math.random().toString(36).substring(7);
              ws.send(JSON.stringify(['REQ', reqId, filter]));
            };

            const handleMessage = (event) => {
              try {
                // Handle different event data format between browser and Node.js
                const rawData = isNodeWs ? event : event.data;
                const data = JSON.parse(rawData);

                if (
                  data[0] === 'EVENT' &&
                  data[2].kind === 0 &&
                  data[2].pubkey === hexPubkey
                ) {
                  console.log(`Got profile from ${relayUrl}:`, data[2]);
                  clearTimeout(timeoutId);
                  ws.close();
                  resolve(data[2]);
                } else if (data[0] === 'EOSE') {
                  console.log(`End of stored profile events from ${relayUrl}`);
                  clearTimeout(timeoutId);
                  ws.close();
                  resolve(null);
                }
              } catch (e) {
                console.log(`Error parsing WebSocket message for profile:`, e);
              }
            };

            const handleError = () => {
              console.log(`WebSocket error for profile fetch from ${relayUrl}`);
              clearTimeout(timeoutId);
              ws.close();
              resolve(null);
            };

            const handleClose = () => {
              clearTimeout(timeoutId);
              resolve(null);
            };

            // Set up event handlers based on environment
            if (isNodeWs) {
              // Node.js ws package event handling
              ws.on('open', handleOpen);
              ws.on('message', handleMessage);
              ws.on('error', handleError);
              ws.on('close', handleClose);
            } else {
              // Browser WebSocket event handling
              ws.onopen = handleOpen;
              ws.onmessage = handleMessage;
              ws.onerror = handleError;
              ws.onclose = handleClose;
            }
          } catch (e) {
            console.log(`Error creating WebSocket for profile fetch:`, e);
            resolve(null);
          }
        });
      };

      // Create WebSocket promises for all default relays
      const fetchPromises = defaultRelays.map(relayUrl =>
        getProfileViaWebSocket(relayUrl)
      );

      // Wait for all promises and collect results
      const results = await Promise.all(fetchPromises);
      const profileEvent = results.find(result => result !== null);

      if (profileEvent && profileEvent.content) {
        try {
          const profileData = JSON.parse(profileEvent.content);
          console.log('Found profile data:', profileData);
          return profileData;
        } catch (e) {
          console.log('Error parsing profile JSON:', e);
        }
      }

      // If we get here, no profile was found or it couldn't be parsed
      console.log('No valid profile found');
      return null;
    } catch (e) {
      console.error('Error in fetchProfileForPubkey:', e);
      return null;
    }
  }

  /**
   * Extract website from profile data
   * @param {object} profileData - Profile data
   * @returns {string|null} - Website URL or null if not found
   */
  function getWebsiteFromProfile (profileData) {
    if (!profileData) return null;

    // Check for website field
    if (
      profileData.website &&
      typeof profileData.website === 'string' &&
      profileData.website.trim() !== ''
    ) {
      let website = profileData.website.trim();

      // Ensure website starts with http:// or https://
      if (
        !website.startsWith('http://') &&
        !website.startsWith('https://')
      ) {
        website = 'https://' + website;
      }

      console.log('Found website in profile:', website);
      return website;
    }

    return null;
  }

  /**
   * Extract storage endpoints from profile data
   * @param {object} profileData - Profile data
   * @returns {string[]|null} - Array of storage endpoints or null if not found
   */
  function getStorageFromProfile (profileData) {
    if (!profileData) return null;

    // Check for storage field
    if (profileData.storage) {
      if (
        typeof profileData.storage === 'string' &&
        profileData.storage.trim() !== ''
      ) {
        // Handle single storage string
        let storage = profileData.storage.trim();

        // Ensure storage starts with http:// or https://
        if (
          !storage.startsWith('http://') &&
          !storage.startsWith('https://')
        ) {
          storage = 'https://' + storage;
        }

        console.log('Found storage endpoint in profile:', storage);
        return [storage]; // Return as array for consistency
      } else if (Array.isArray(profileData.storage)) {
        // Handle array of storage endpoints
        const storageEndpoints = profileData.storage
          .filter(s => typeof s === 'string' && s.trim() !== '')
          .map(s => {
            let endpoint = s.trim();
            // Ensure each endpoint starts with http:// or https://
            if (
              !endpoint.startsWith('http://') &&
              !endpoint.startsWith('https://')
            ) {
              endpoint = 'https://' + endpoint;
            }
            return endpoint;
          });

        if (storageEndpoints.length > 0) {
          console.log('Found storage endpoints in profile:', storageEndpoints);
          return storageEndpoints;
        }
      }
    }

    return null;
  }

  /**
   * Helper to get URL parameters
   * @param {string} name - Parameter name
   * @returns {string|null} - Parameter value or null if not found
   */
  function getUrlParameter (name) {
    if (typeof window !== 'undefined') { // Browser environment
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    }
    return null; // Not in browser environment
  }

  // Create the object to export
  const didNostrResolver = {
    isValidNostrPubkey,
    isValidPubkey,
    normalizePublicKey,
    npubToHex,
    createDidNostr,
    createDidNostrDocument,
    resolveDidNostr,
    fetchRelaysForPubkey,
    fetchProfileForPubkey,
    getWebsiteFromProfile,
    getStorageFromProfile,
    getUrlParameter
  };

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = didNostrResolver;
  }

  // Export for browser (global)
  if (typeof window !== 'undefined') {
    window.didNostrResolver = didNostrResolver;
  }

})(); // End of IIFE 