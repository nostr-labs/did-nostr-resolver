# DID-Nostr HTTP Resolution Examples

This directory contains examples of how to implement HTTP-based resolution for DID-Nostr identifiers.

## HTTP Resolution Method

The DID-Nostr resolver supports HTTP-based resolution via the `.well-known/did/nostr/<pubkey>.json` endpoint. This allows website owners to directly provide profile information for specific Nostr public keys without relying on WebSocket connections to Nostr relays.

### How It Works

1. When resolving a DID or fetching a profile, the resolver will first attempt to retrieve information from:

   ```
   https://<domain>/.well-known/did/nostr/<pubkey>.json
   ```

2. If successful, the resolver will use this information and stop further resolution attempts.

3. If no profile is found via HTTP, the resolver will fall back to querying Nostr relays.

### Implementation on Your Domain

To implement HTTP resolution for a Nostr public key on your domain:

1. Create a JSON file following the Nostr profile format (see `well-known-profile.json` example)

2. Place the file at:

   ```
   .well-known/did/nostr/<pubkey>.json
   ```

   Where `<pubkey>` is the 64-character hex Nostr public key (without any prefix)

3. Ensure the file is served with proper CORS headers to allow access from browsers.

### Example Profile

See `well-known-profile.json` for an example of a profile JSON file. This matches the format used by Nostr kind 0 profile metadata events.

Key fields that the resolver will look for:

- `website`: Website URL to include in the DID document
- `storage`: Array of storage endpoints to include in the DID document
- `relays`: Array of relay URLs to include in the DID document

### Testing

You can test your HTTP resolution setup with the DID-Nostr Resolver CLI:

```bash
did-nostr-resolver create <pubkey> --domains=yourdomain.com -v
```

or with the web interface by entering a public key and specifying domains to check.

## Benefits of HTTP Resolution

1. **Performance**: Direct HTTP requests are typically faster than establishing WebSocket connections to relays
2. **Control**: Website owners have direct control over the profile information they provide
3. **Reliability**: No dependency on third-party relay availability
4. **Privacy**: Users don't need to connect to public relays

This approach also enables static website hosting services to participate in the DID-Nostr ecosystem without running Nostr relays.
