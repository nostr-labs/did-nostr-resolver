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
  console.log('  did-nostr-resolver create <pubkey> [--relays=wss://relay1.com,wss://relay2.com]');
  console.log('  did-nostr-resolver resolve <did>');
  console.log('');
  console.log(`${colors.bright}Commands:${colors.reset}`);
  console.log(`  ${colors.green}create${colors.reset}  - Create a DID document from a Nostr public key`);
  console.log(`  ${colors.green}resolve${colors.reset} - Resolve a DID to a DID document`);
  console.log('');
  console.log(`${colors.bright}Options:${colors.reset}`);
  console.log(`  ${colors.green}--minimal${colors.reset}           - 🚀 NEW: Offline-first resolution (instant, no network required)`);
  console.log('  --relays=<urls>     - Comma-separated list of relay URLs to include in the service section');
  console.log('  --domains=<domains> - Comma-separated list of domains to try for HTTP resolution');
  console.log('  --use-http          - Enable HTTP resolution via .well-known/did/nostr/<pubkey>.json');
  console.log('  --output=<path>     - Save the output to a file instead of stdout');
  console.log('  --include-profile   - Fetch and include profile information (website and storage)');
  console.log('  --no-profile        - Skip fetching profile information');
  console.log('  --fetch-relays      - Fetch relay list from Nostr network (kind 10002 events)');
  console.log('  --no-fetch-relays   - Skip fetching relay list from Nostr network');
  console.log('  -v, --verbose       - Enable verbose output (quiet mode is default)');
  console.log('');
  console.log(`${colors.bright}Default Behavior:${colors.reset}`);
  console.log('  By default, the CLI runs in quiet mode, outputting only the DID document JSON.');
  console.log('  The CLI will attempt to fetch relays from the Nostr network (kind 10002 events).');
  console.log('  Relays will ONLY be included in the DID document if found in kind 10002 events.');
  console.log('  If no relays are found, the DID document will not include any relay endpoints.');
  console.log('  Use --no-fetch-relays to include the default relays instead.');
  console.log('  Specify your own relays with --relays=... to override this behavior.');
  console.log('  HTTP resolution is used by default when --domains are specified or --use-http is set.');
  console.log('');
  console.log(`${colors.bright}Examples:${colors.reset}`);
  console.log(`  ${colors.green}# Offline-first resolution (RECOMMENDED - instant, works offline)${colors.reset}`);
  console.log('  did-nostr-resolver create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --minimal');
  console.log('  did-nostr-resolver resolve did:nostr:32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --minimal');
  console.log('');
  console.log(`  ${colors.green}# Enhanced resolution with optional network queries${colors.reset}`);
  console.log('  did-nostr-resolver create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245');
  console.log('  did-nostr-resolver create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 -v');
  console.log('  did-nostr-resolver create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --include-profile');
  console.log('  did-nostr-resolver create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --no-fetch-relays');
  console.log('  did-nostr-resolver resolve did:nostr:32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245');
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
    domains: [],                // No default domains for HTTP
    useHttp: false,             // Default to not using HTTP
    output: null,
    includeProfile: true,       // Default to including profile information
    fetchRelays: true,          // Default to fetching relays from kind 10002 events
    verbose: false,             // Default to quiet mode
    minimal: false              // Default to enhanced resolution
  };

  for (let i = 2; i < args.length; i++) {
    if (args[i].startsWith('--relays=')) {
      const relayStr = args[i].substring('--relays='.length);
      // Override defaults if user specifies relays
      options.relays = relayStr.split(',').map(r => r.trim()).filter(r => r.length > 0);
      // When user explicitly specifies relays, don't fetch from network unless explicitly enabled
      options.fetchRelays = false;
    } else if (args[i].startsWith('--domains=')) {
      const domainsStr = args[i].substring('--domains='.length);
      options.domains = domainsStr.split(',').map(d => d.trim()).filter(d => d.length > 0);
      // If domains are specified, enable HTTP resolution
      options.useHttp = true;
    } else if (args[i] === '--use-http') {
      options.useHttp = true;
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
    } else if (args[i] === '-v' || args[i] === '--verbose') {
      options.verbose = true;
    } else if (args[i] === '--minimal') {
      options.minimal = true;
      // When using minimal mode, skip profile fetching and relay fetching
      options.includeProfile = false;
      options.fetchRelays = false;
    }
  }

  return options;
}

// Utility function for logging with verbosity control
function log (options, message, type = 'info') {
  if (!options.verbose) return;

  switch (type) {
    case 'error':
      console.error(message);
      break;
    case 'warn':
      console.log(`${colors.yellow}${message}${colors.reset}`);
      break;
    case 'success':
      console.log(`${colors.green}${message}${colors.reset}`);
      break;
    case 'bright':
      console.log(`${colors.bright}${message}${colors.reset}`);
      break;
    default:
      console.log(message);
  }
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

    log(options, `${colors.yellow}Creating DID document for public key: ${colors.bright}${pubkey}${colors.reset}`);

    // If minimal mode is requested, use offline-first resolution
    if (options.minimal) {
      log(options, `${colors.green}🚀 Using minimal mode: Offline-first resolution (instant, no network)${colors.reset}`);
      
      const didDocument = resolver.createDidNostrDocumentMinimal(pubkey);
      
      if (!didDocument) {
        console.error(`${colors.red}Error: Failed to create minimal DID document${colors.reset}`);
        return 1;
      }

      const output = JSON.stringify(didDocument, null, 2);

      // Save to file or print to stdout
      if (options.output) {
        try {
          fs.writeFileSync(options.output, output);
          log(options, `${colors.green}Minimal DID document saved to ${options.output}${colors.reset}`);
        } catch (error) {
          console.error(`${colors.red}Error writing to file: ${error.message}${colors.reset}`);
          return 1;
        }
      } else {
        log(options, `${colors.bright}Minimal DID Document (Offline-First):${colors.reset}`);
        console.log(output);
      }
      return 0;
    }

    // Enhanced mode continues below...
    log(options, `${colors.yellow}Using enhanced mode: Network queries for service endpoints${colors.reset}`);

    // Log HTTP resolution status
    if (options.useHttp) {
      log(options, `${colors.green}HTTP resolution enabled: Will check .well-known/did/nostr/${pubkey}.json${colors.reset}`);
    }

    // Initialize relays - only use them if explicitly specified via --relays or found in kind 10002 events
    let relays = options.fetchRelays ? [] : [...options.relays];

    // Try to fetch relay list from Nostr network if enabled
    if (options.fetchRelays) {
      log(options, `${colors.yellow}Fetching relay list from Nostr network (kind 10002 events)...${colors.reset}`);
      try {
        const fetchedRelays = await resolver.fetchRelaysForPubkey(pubkey, { verbose: options.verbose });
        if (fetchedRelays && fetchedRelays.length > 0) {
          log(options, `${colors.green}Found ${fetchedRelays.length} relays from Nostr metadata${colors.reset}`);
          // Use only the fetched relays
          relays = fetchedRelays;
        } else {
          log(options, `${colors.yellow}No relays found in Nostr metadata, not including any relay endpoints${colors.reset}`);
        }
      } catch (error) {
        log(options, `${colors.yellow}Error fetching relays from Nostr: ${error.message}. Not including any relay endpoints.${colors.reset}`);
      }
    }

    if (relays.length > 0) {
      log(options, `${colors.yellow}Including relays: ${colors.reset}${relays.join(', ')}`);
    } else {
      log(options, `${colors.yellow}No relays will be included in the DID document${colors.reset}`);
    }

    // Fetch profile information if requested
    let website = null;
    let storage = null;
    if (options.includeProfile) {
      log(options, `${colors.yellow}Fetching profile information...${colors.reset}`);

      // Log HTTP resolution status if enabled
      if (options.useHttp) {
        if (options.domains.length > 0) {
          log(options, `${colors.yellow}Attempting HTTP resolution from domains: ${colors.reset}${options.domains.join(', ')}`);
        } else {
          log(options, `${colors.yellow}Attempting HTTP resolution from auto-detected domains${colors.reset}`);
        }
      }

      try {
        const profileData = await resolver.fetchProfileForPubkey(pubkey, {
          verbose: options.verbose,
          domains: options.domains
        });

        if (profileData) {
          website = resolver.getWebsiteFromProfile(profileData, { verbose: options.verbose });
          storage = resolver.getStorageFromProfile(profileData, { verbose: options.verbose });

          if (website) {
            log(options, `${colors.yellow}Found website: ${colors.reset}${website}`);
          }

          if (storage && storage.length > 0) {
            log(options, `${colors.yellow}Found storage endpoints: ${colors.reset}${storage.join(', ')}`);
          }
        } else {
          log(options, `${colors.yellow}No profile information found${colors.reset}`);
        }
      } catch (error) {
        log(options, `${colors.yellow}Error fetching profile: ${error.message}${colors.reset}`);
      }
    }

    // Create DID document
    const didDocument = await resolver.createDidNostrDocument(pubkey, {
      relays: relays,
      website: website,
      storage: storage,
      domains: options.domains,
      verbose: options.verbose
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
        log(options, `${colors.green}DID document saved to ${options.output}${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}Error writing to file: ${error.message}${colors.reset}`);
        return 1;
      }
    } else {
      log(options, `${colors.bright}DID Document:${colors.reset}`);
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

    log(options, `${colors.yellow}Resolving DID: ${colors.bright}${did}${colors.reset}`);

    // If minimal mode is requested, use offline-first resolution
    if (options.minimal) {
      log(options, `${colors.green}🚀 Using minimal mode: Offline-first resolution (instant, no network)${colors.reset}`);
      
      const didDocument = resolver.resolveDidNostrMinimal(did);
      
      if (!didDocument) {
        console.error(`${colors.red}Error: Failed to resolve DID in minimal mode${colors.reset}`);
        return 1;
      }

      const output = JSON.stringify(didDocument, null, 2);

      // Save to file or print to stdout
      if (options.output) {
        try {
          fs.writeFileSync(options.output, output);
          log(options, `${colors.green}Minimal DID document saved to ${options.output}${colors.reset}`);
        } catch (error) {
          console.error(`${colors.red}Error writing to file: ${error.message}${colors.reset}`);
          return 1;
        }
      } else {
        log(options, `${colors.bright}Minimal DID Document (Offline-First):${colors.reset}`);
        console.log(output);
      }
      return 0;
    }

    // Enhanced mode continues below...
    log(options, `${colors.yellow}Using enhanced mode: Network queries for service endpoints${colors.reset}`);

    // Extract pubkey from DID
    const didMatch = did.match(/^did:nostr:([0-9a-f]{64})$/i);
    if (!didMatch) {
      console.error(`${colors.red}Error: Invalid DID-Nostr format${colors.reset}`);
      return 1;
    }

    const pubkey = didMatch[1];

    // Log HTTP resolution status
    if (options.useHttp) {
      log(options, `${colors.green}HTTP resolution enabled: Will check .well-known/did/nostr/${pubkey}.json${colors.reset}`);
    }

    // Initialize relays - only use them if explicitly specified via --relays or found in kind 10002 events
    let relays = options.fetchRelays ? [] : [...options.relays];

    // Try to fetch relay list from Nostr network if enabled
    if (options.fetchRelays) {
      log(options, `${colors.yellow}Fetching relay list from Nostr network (kind 10002 events)...${colors.reset}`);
      try {
        const fetchedRelays = await resolver.fetchRelaysForPubkey(pubkey, { verbose: options.verbose });
        if (fetchedRelays && fetchedRelays.length > 0) {
          log(options, `${colors.green}Found ${fetchedRelays.length} relays from Nostr metadata${colors.reset}`);
          // Use only the fetched relays
          relays = fetchedRelays;
        } else {
          log(options, `${colors.yellow}No relays found in Nostr metadata, not including any relay endpoints${colors.reset}`);
        }
      } catch (error) {
        log(options, `${colors.yellow}Error fetching relays from Nostr: ${error.message}. Not including any relay endpoints.${colors.reset}`);
      }
    }

    if (relays.length > 0) {
      log(options, `${colors.yellow}Including relays: ${colors.reset}${relays.join(', ')}`);
    } else {
      log(options, `${colors.yellow}No relays will be included in the DID document${colors.reset}`);
    }

    // Fetch profile information if requested
    let website = null;
    let storage = null;
    if (options.includeProfile) {
      log(options, `${colors.yellow}Fetching profile information...${colors.reset}`);

      // Log HTTP resolution status if enabled
      if (options.useHttp) {
        if (options.domains.length > 0) {
          log(options, `${colors.yellow}Attempting HTTP resolution from domains: ${colors.reset}${options.domains.join(', ')}`);
        } else {
          log(options, `${colors.yellow}Attempting HTTP resolution from auto-detected domains${colors.reset}`);
        }
      }

      try {
        const profileData = await resolver.fetchProfileForPubkey(pubkey, {
          verbose: options.verbose,
          domains: options.domains
        });

        if (profileData) {
          website = resolver.getWebsiteFromProfile(profileData, { verbose: options.verbose });
          storage = resolver.getStorageFromProfile(profileData, { verbose: options.verbose });

          if (website) {
            log(options, `${colors.yellow}Found website: ${colors.reset}${website}`);
          }

          if (storage && storage.length > 0) {
            log(options, `${colors.yellow}Found storage endpoints: ${colors.reset}${storage.join(', ')}`);
          }
        } else {
          log(options, `${colors.yellow}No profile information found${colors.reset}`);
        }
      } catch (error) {
        log(options, `${colors.yellow}Error fetching profile: ${error.message}${colors.reset}`);
      }
    }

    // Resolve DID document
    const didDocument = await resolver.resolveDidNostr(did, {
      relays: relays,
      website: website,
      storage: storage,
      domains: options.domains,
      verbose: options.verbose
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
        log(options, `${colors.green}DID document saved to ${options.output}${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}Error writing to file: ${error.message}${colors.reset}`);
        return 1;
      }
    } else {
      log(options, `${colors.bright}DID Document:${colors.reset}`);
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