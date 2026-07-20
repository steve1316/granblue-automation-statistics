# Mail server

A self-hosted Postfix container that sends the website's password-recovery emails directly to
recipients (no third-party relay) and signs them with DKIM.

## Setup

1. `cp mail/.env.example mail/.env` and set `ALLOWED_SENDER_DOMAINS` to your domain.
2. Set the `mail` service's `hostname` in `docker-compose.yml` to the server's real mail hostname
   (e.g. `mail.granblue-automation-statistics.com`).
3. `docker compose up -d mail`. On first boot a DKIM key is generated into `./mail/dkim`.
4. Publish the DNS records below, then the backend can send through the `mail` service on port 587.

## Required DNS (without these, mail lands in spam or is rejected)

For a mail hostname `mail.example.com` sending as `example.com`:

- **A record** - `mail.example.com` -> the server's public IP.
- **Reverse DNS (PTR)** - the server's IP -> `mail.example.com`. Set this with your hosting provider;
  many mail receivers reject senders whose PTR does not match.
- **SPF** (TXT on `example.com`) - e.g. `v=spf1 a:mail.example.com -all`.
- **DKIM** (TXT) - publish the generated public key. After first boot it is in
  `./mail/dkim/<domain>/` (a `*.txt` file with the record contents), under the selector `mail`
  by default, i.e. `mail._domainkey.example.com`.
- **DMARC** (TXT on `_dmarc.example.com`) - e.g. `v=DMARC1; p=none; rua=mailto:postmaster@example.com`.

## Also required

- **Outbound port 25 must be open** from the server. Many cloud providers block it by default and
  require a support request to open it. Without it, direct delivery cannot work.

If your host cannot open port 25 or set a PTR record, switch the container to relay through an SMTP
provider instead (set `RELAYHOST` + credentials in `mail/.env`); the same image supports that.
