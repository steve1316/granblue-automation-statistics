# Self-hosted Postfix mail server for the website's password-recovery emails.
#
# It delivers mail directly to recipients (no third-party smarthost) and signs outgoing
# messages with DKIM. For that mail to actually reach inboxes, the server's public hostname
# needs proper DNS - see ./README.md for the required A / PTR / SPF / DKIM / DMARC records
# and the port 25 requirement.
#
# Configured via environment variables - see ./.env.example, supplied through docker-compose.
#
# Pin this to a specific tag or digest in production for reproducible builds.
FROM boky/postfix:latest
