#!/usr/bin/env node

/**
 * did-nostr-resolver CLI
 * Command-line tool to work with Nostr Decentralized Identifiers (DIDs)
 * 
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const {
  isValidNostrPubkey,
  createDidNostr,
  createDidNostrDocument,
  resolveDidNostr
} = require('../index');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const param = args[1];
const relays = args.slice(2);

function printUsage () {
  console.log(`
did-nostr-resolver CLI

Usage:
  npx did-nostr-resolver create <pubkey> [relay1 relay2 ...]  - Create a DID document from a pubkey
  npx did-nostr-resolver resolve <did> [relay1 relay2 ...]    - Resolve a DID to a DID document
  npx did-nostr-resolver help                                - Show this help message

Examples:
  npx did-nostr-resolver create 124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2
  npx did-nostr-resolver create 124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2 wss://relay.example.org/
  npx did-nostr-resolver resolve did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2
  `);
}

function saveToFile (data, filename) {
  try {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`DID document saved to ${filename}`);
  } catch (error) {
    console.error(`Error saving file: ${error.message}`);
  }
}

function handleCreate (pubkey, relays) {
  if (!pubkey) {
    console.error('Error: No pubkey provided');
    printUsage();
    process.exit(1);
  }

  if (!isValidNostrPubkey(pubkey)) {
    console.error('Error: Invalid Nostr public key format');
    process.exit(1);
  }

  const didDocument = createDidNostrDocument(pubkey, { relays });
  if (!didDocument) {
    console.error('Error: Failed to create DID document');
    process.exit(1);
  }

  console.log(JSON.stringify(didDocument, null, 2));

  // Save to file with the DID as filename
  const did = createDidNostr(pubkey);
  if (did) {
    const filename = `${did.replace(/:/g, '-')}.json`;
    saveToFile(didDocument, filename);
  }
}

function handleResolve (did, relays) {
  if (!did) {
    console.error('Error: No DID provided');
    printUsage();
    process.exit(1);
  }

  const didDocument = resolveDidNostr(did, { relays });
  if (!didDocument) {
    console.error('Error: Failed to resolve DID');
    process.exit(1);
  }

  console.log(JSON.stringify(didDocument, null, 2));

  // Save to file with the DID as filename
  const filename = `${did.replace(/:/g, '-')}.json`;
  saveToFile(didDocument, filename);
}

// Main execution
switch (command) {
  case 'create':
    handleCreate(param, relays);
    break;
  case 'resolve':
    handleResolve(param, relays);
    break;
  case 'help':
  default:
    printUsage();
    break;
} 