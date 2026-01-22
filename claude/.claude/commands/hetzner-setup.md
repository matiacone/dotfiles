---
description: Create a new Hetzner server with interactive setup
---

Set up a new Hetzner Cloud server with the following steps:

1. Ask the user for:
   - SSH public key (show example format: ssh-ed25519 AAAA... user@email.com)
   - Server name

2. Show available server types with specs using:
   ```bash
   hcloud server-type list | grep -E "cx|cpx" | head -10
   ```
   Let user choose type and confirm specs (vCPU, RAM, storage)

3. Show available locations:
   ```bash
   hcloud location list
   ```
   Let user choose location (default: ash)

4. Ask if they want to use the default cloud-init file at `/home/mathew/Dropbox/creations/server/hetzner-cloud-init.yaml`
   - If yes, update it with their SSH key
   - If no, ask for alternative path

5. Display final configuration:
   - Server name
   - Type (with specs)
   - Location
   - SSH key
   - Cloud-init file path

6. Ask for confirmation before creating

7. If confirmed, create the server:
   ```bash
   hcloud server create \
     --name [server-name] \
     --type [type] \
     --image ubuntu-24.04 \
     --location [location] \
     --user-data-from-file [cloud-init-path]
   ```

8. Show the new server details (IP addresses) and wait time for cloud-init

9. After 2-3 minutes, test SSH connection:
   ```bash
   ssh -i ~/.ssh/id_deal_deploy miacone@[server-ip]
   ```

Always use username "miacone" in the cloud-init configuration.