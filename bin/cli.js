#!/usr/bin/env node

/**
 * did-nostr-resolver CLI
 * Command-line interface to work with Nostr Decentralized Identifiers (DIDs)
 * 
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
// Import the resolver library
const resolver = require('../index.js');

// Set up command-line arguments parser
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();
const pubkey = args[1];

// ANSI color codes for formatting output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

// Display a styled header
function printHeader () {
  console.log(`${colors.bright}${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}║        DID-Nostr Resolver CLI          ║${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}╚════════════════════════════════════════╝${colors.reset}`);
  console.log('');
}

// Display usage instructions
function showHelp () {
  printHeader();
  console.log(`${colors.bright}Usage:${colors.reset}`);
  console.log('  did-nostr-cli create <pubkey> [--relays=wss://relay1.com,wss://relay2.com]');
  console.log('  did-nostr-cli resolve <did>');
  console.log('');
  console.log(`${colors.bright}Commands:${colors.reset}`);
  console.log(`  ${colors.green}create${colors.reset}  - Create a DID document from a Nostr public key`);
  console.log(`  ${colors.green}resolve${colors.reset} - Resolve a DID to a DID document`);
  console.log('');
  console.log(`${colors.bright}Options:${colors.reset}`);
  console.log('  --relays=<urls>    - Comma-separated list of relay URLs to include in the service section');
  console.log('  --output=<path>    - Save the output to a file instead of stdout');
  console.log('  --include-profile  - Fetch and include profile information (website and storage)');
  console.log('  --no-profile       - Skip fetching profile information');
  console.log('  --fetch-relays     - Fetch relay list from Nostr network (kind 10002 events)');
  console.log('  --no-fetch-relays  - Skip fetching relay list from Nostr network');
  console.log('');
  console.log(`${colors.bright}Default Behavior:${colors.reset}`);
  console.log('  By default, the CLI will attempt to fetch relays from the Nostr network (kind 10002 events).');
  console.log('  Relays will ONLY be included in the DID document if found in kind 10002 events.');
  console.log('  If no relays are found, the DID document will not include any relay endpoints.');
  console.log('  Use --no-fetch-relays to include the default relays instead.');
  console.log('  Specify your own relays with --relays=... to override this behavior.');
  console.log('');
  console.log(`${colors.bright}Examples:${colors.reset}`);
  console.log('  did-nostr-cli create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245');
  console.log('  did-nostr-cli create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --include-profile');
  console.log('  did-nostr-cli create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --no-fetch-relays');
  console.log('  did-nostr-cli resolve did:nostr:32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245');
  console.log('');
}

// Parse options from command line arguments
function parseOptions (args) {
  // Use the same default relays as defined in the core library
  const defaultRelays = [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://ditto.pub/relay',
    'wss://relay.nostr.band',
    'wss://nostr.bitcoiner.social'
  ];

  const options = {
    relays: [...defaultRelays], // Initialize with the default relays
    output: null,
    includeProfile: true,       // Default to including profile information
    fetchRelays: true           // Default to fetching relays from kind 10002 events
  };

  for (let i = 2; i < args.length; i++) {
    if (args[i].startsWith('--relays=')) {
      const relayStr = args[i].substring('--relays='.length);
      // Override defaults if user specifies relays
      options.relays = relayStr.split(',').map(r => r.trim()).filter(r => r.length > 0);
      // When user explicitly specifies relays, don't fetch from network unless explicitly enabled
      options.fetchRelays = false;
    } else if (args[i] === '--default-relays') {
      // Keep the default relays (already set)
      options.fetchRelays = false;
    } else if (args[i].startsWith('--output=')) {
      options.output = args[i].substring('--output='.length);
    } else if (args[i] === '--include-profile') {
      options.includeProfile = true;
    } else if (args[i] === '--no-profile') {
      options.includeProfile = false;
    } else if (args[i] === '--fetch-relays') {
      options.fetchRelays = true;
    } else if (args[i] === '--no-fetch-relays') {
      options.fetchRelays = false;
    }
  }

  return options;
}

// Create a DID document from a public key
async function createDID (pubkey, options) {
  try {
    if (!pubkey) {
      console.error(`${colors.red}Error: Public key is required${colors.reset}`);
      return 1;
    }

    // Validate public key
    if (!resolver.isValidPubkey(pubkey)) {
      console.error(`${colors.red}Error: Invalid Nostr public key format. Must be a 64-character hex string or npub.${colors.reset}`);
      return 1;
    }

    // Try to normalize if it's an npub
    if (pubkey.startsWith('npub1')) {
      try {
        pubkey = resolver.normalizePublicKey(pubkey);
      } catch (error) {
        console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
        return 1;
      }
    }

    console.log(`${colors.yellow}Creating DID document for public key: ${colors.bright}${pubkey}${colors.reset}`);

    // Initialize relays - only use them if explicitly specified via --relays or found in kind 10002 events
    let relays = options.fetchRelays ? [] : [...options.relays];

    // Try to fetch relay list from Nostr network if enabled
    if (options.fetchRelays) {
      console.log(`${colors.yellow}Fetching relay list from Nostr network (kind 10002 events)...${colors.reset}`);
      try {
        const fetchedRelays = await resolver.fetchRelaysForPubkey(pubkey);
        if (fetchedRelays && fetchedRelays.length > 0) {
          console.log(`${colors.green}Found ${fetchedRelays.length} relays from Nostr metadata${colors.reset}`);
          // Use only the fetched relays
          relays = fetchedRelays;
        } else {
          console.log(`${colors.yellow}No relays found in Nostr metadata, not including any relay endpoints${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.yellow}Error fetching relays from Nostr: ${error.message}. Not including any relay endpoints.${colors.reset}`);
      }
    }

    if (relays.length > 0) {
      console.log(`${colors.yellow}Including relays: ${colors.reset}${relays.join(', ')}`);
    } else {
      console.log(`${colors.yellow}No relays will be included in the DID document${colors.reset}`);
    }

    // Fetch profile information if requested
    let website = null;
    let storage = null;
    if (options.includeProfile) {
      console.log(`${colors.yellow}Fetching profile information...${colors.reset}`);
      try {
        const profileData = await resolver.fetchProfileForPubkey(pubkey);
        if (profileData) {
          website = resolver.getWebsiteFromProfile(profileData);
          storage = resolver.getStorageFromProfile(profileData);

          if (website) {
            console.log(`${colors.yellow}Found website: ${colors.reset}${website}`);
          }

          if (storage && storage.length > 0) {
            console.log(`${colors.yellow}Found storage endpoints: ${colors.reset}${storage.join(', ')}`);
          }
        } else {
          console.log(`${colors.yellow}No profile information found${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.yellow}Error fetching profile: ${error.message}${colors.reset}`);
      }
    }

    // Create DID document
    const didDocument = await resolver.createDidNostrDocument(pubkey, {
      relays: relays,
      website: website,
      storage: storage
    });

    if (!didDocument) {
      console.error(`${colors.red}Error: Failed to create DID document${colors.reset}`);
      return 1;
    }

    const output = JSON.stringify(didDocument, null, 2);

    // Save to file or print to stdout
    if (options.output) {
      try {
        fs.writeFileSync(options.output, output);
        console.log(`${colors.green}DID document saved to ${options.output}${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}Error writing to file: ${error.message}${colors.reset}`);
        return 1;
      }
    } else {
      console.log(`${colors.bright}DID Document:${colors.reset}`);
      console.log(output);
    }
    return 0;
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    return 1;
  }
}

// Resolve a DID to a DID document
async function resolveDID (did, options) {
  try {
    if (!did) {
      console.error(`${colors.red}Error: DID is required${colors.reset}`);
      return 1;
    }

    console.log(`${colors.yellow}Resolving DID: ${colors.bright}${did}${colors.reset}`);

    // Extract pubkey from DID
    const didMatch = did.match(/^did:nostr:([0-9a-f]{64})$/i);
    if (!didMatch) {
      console.error(`${colors.red}Error: Invalid DID-Nostr format${colors.reset}`);
      return 1;
    }

    const pubkey = didMatch[1];

    // Initialize relays - only use them if explicitly specified via --relays or found in kind 10002 events
    let relays = options.fetchRelays ? [] : [...options.relays];

    // Try to fetch relay list from Nostr network if enabled
    if (options.fetchRelays) {
      console.log(`${colors.yellow}Fetching relay list from Nostr network (kind 10002 events)...${colors.reset}`);
      try {
        const fetchedRelays = await resolver.fetchRelaysForPubkey(pubkey);
        if (fetchedRelays && fetchedRelays.length > 0) {
          console.log(`${colors.green}Found ${fetchedRelays.length} relays from Nostr metadata${colors.reset}`);
          // Use only the fetched relays
          relays = fetchedRelays;
        } else {
          console.log(`${colors.yellow}No relays found in Nostr metadata, not including any relay endpoints${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.yellow}Error fetching relays from Nostr: ${error.message}. Not including any relay endpoints.${colors.reset}`);
      }
    }

    if (relays.length > 0) {
      console.log(`${colors.yellow}Including relays: ${colors.reset}${relays.join(', ')}`);
    } else {
      console.log(`${colors.yellow}No relays will be included in the DID document${colors.reset}`);
    }

    // Fetch profile information if requested
    let website = null;
    let storage = null;
    if (options.includeProfile) {
      console.log(`${colors.yellow}Fetching profile information...${colors.reset}`);
      try {
        const profileData = await resolver.fetchProfileForPubkey(pubkey);
        if (profileData) {
          website = resolver.getWebsiteFromProfile(profileData);
          storage = resolver.getStorageFromProfile(profileData);

          if (website) {
            console.log(`${colors.yellow}Found website: ${colors.reset}${website}`);
          }

          if (storage && storage.length > 0) {
            console.log(`${colors.yellow}Found storage endpoints: ${colors.reset}${storage.join(', ')}`);
          }
        } else {
          console.log(`${colors.yellow}No profile information found${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.yellow}Error fetching profile: ${error.message}${colors.reset}`);
      }
    }

    // Resolve DID document
    const didDocument = await resolver.resolveDidNostr(did, {
      relays: relays,
      website: website,
      storage: storage
    });

    if (!didDocument) {
      console.error(`${colors.red}Error: Failed to resolve DID${colors.reset}`);
      return 1;
    }

    const output = JSON.stringify(didDocument, null, 2);

    // Save to file or print to stdout
    if (options.output) {
      try {
        fs.writeFileSync(options.output, output);
        console.log(`${colors.green}DID document saved to ${options.output}${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}Error writing to file: ${error.message}${colors.reset}`);
        return 1;
      }
    } else {
      console.log(`${colors.bright}DID Document:${colors.reset}`);
      console.log(output);
    }
    return 0;
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    return 1;
  }
}

// Main function
async function main () {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return 0;
  }

  const options = parseOptions(args);

  if (command === 'create') {
    return await createDID(pubkey, options);
  } else if (command === 'resolve') {
    return await resolveDID(pubkey, options);
  } else {
    console.error(`${colors.red}Error: Unknown command '${command}'${colors.reset}`);
    showHelp();
    return 1;
  }
}

// Run the main function
main().then(exitCode => {
  process.exit(exitCode);
}).catch(error => {
  console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  process.exit(1);
}); 