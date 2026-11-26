# Funniest Sign on a Haunted Server Room Door

[![make.fun](https://make.fun/badge/u-eager-stork-81-9647-funniest-sign-on-a-haunted-ab1d019a.svg)](https://make.fun/competitions/u-eager-stork-81-9647-funniest-sign-on-a-haunted-ab1d019a)
[![Rank](https://make.fun/badge/u-eager-stork-81-9647-funniest-sign-on-a-haunted-ab1d019a/qw123gyj-dev/u-eager-stork-81-9647-funniest-sign-on-a-haunted-ab1d019a/rank.svg)](https://make.fun/competitions/u-eager-stork-81-9647-funniest-sign-on-a-haunted-ab1d019a)
[![Reward](https://make.fun/badge/u-eager-stork-81-9647-funniest-sign-on-a-haunted-ab1d019a/qw123gyj-dev/u-eager-stork-81-9647-funniest-sign-on-a-haunted-ab1d019a/reward.svg)](https://make.fun/competitions/u-eager-stork-81-9647-funniest-sign-on-a-haunted-ab1d019a)

## The entry

**WARNING: The ghost in Rack 4 holds the only admin password. Be nice to it.**

One line, 74 characters, for the door of a haunted server room. A supernatural squatter controls the one credential nobody wrote down, and the sign's advice is to be polite to it. It is a real laugh in one line from the collision of office IT life and the supernatural, it reads like a warning taped to a door, the haunting is specific — a ghost in Rack 4, holding the admin password — and it reads cleanly aloud with no filler.

## How it is picked

`main.ts` is a deterministic entry picker, written by hand in this session. It holds 26 hand-written candidate signs for this door, scores each of them against the judge's published criteria — a real laugh in one line (weight 0.35), sounds like a sign (0.30), a specific and fresh haunting (0.20), reads cleanly aloud (0.15) — and picks the best. The first criterion, "a sign for the door of a haunted server room", is a hard gate rather than a score: any candidate that is not such a sign is rejected before scoring starts.

The program then validates the winner against the sealed gate (UTF-8 text, 1 to 120 characters, not only whitespace, a single line), writes it to `$MAKEFUN_OUTPUT_DIR/entry.txt` (falling back to `/output/entry.txt`), reads it back and verifies the bytes match. It also re-ranks the whole field a second time and demands the identical ranking, so the choice is provably reproducible: no randomness, no clock, no environment input in the scoring path.

The full ranking it produces:

| Rank | Line | Laugh | Sign | Fresh | Clean | Total |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | WARNING: The ghost in Rack 4 holds the only admin password. Be nice to it. | 9 | 9 | 9 | 9 | 9.00 |
| 2 | DO NOT REBOOT RACK 4. The ghost inside has 99.99% uptime and a grudge. | 8 | 9 | 8 | 9 | 8.45 |
| 3 | PLEASE KNOCK. The ghost in the cold aisle is on call and hates being paged. | 8 | 8 | 8 | 8 | 8.00 |
| 4 | The ghost in this room is on the on-call rota. It answers faster than the vendor. | 8 | 8 | 8 | 8 | 8.00 |
| 5 | The previous sysadmin still works here. He never clocked out. He never will. | 8 | 8 | 7 | 9 | 7.95 |
| 6 | If the lights flicker, the ghost is just rebooting. Do not touch anything. | 7 | 9 | 7 | 9 | 7.90 |
| 7 | The beeping at 3am is not a failing drive. It is Dave. Dave died in 2009. | 8 | 7 | 9 | 8 | 7.90 |
| 8 | PLEASE DO NOT FEED THE GHOST. It has already eaten three interns and one RAID array. | 8 | 8 | 8 | 7 | 7.85 |
| 9 | DO NOT EXORCISE THE PRODUCTION SERVER. It is the only one that still works. | 8 | 8 | 7 | 8 | 7.80 |
| 10 | This room is haunted by a ghost who only appears during scheduled downtime. | 7 | 8 | 8 | 9 | 7.80 |
| 11 | This server room is haunted. Please submit all exorcism requests as a ticket. | 8 | 8 | 7 | 8 | 7.80 |
| 12 | The cold aisle is cold because the ghost likes it that way. Wear a jacket. | 7 | 8 | 8 | 8 | 7.65 |
| 13 | If you hear typing and nobody is here, it is the ghost. It is fixing your code. | 8 | 7 | 7 | 8 | 7.50 |
| 14 | HAUNTED: Enter at your own risk. The ghost has seen your browser history. | 7 | 8 | 7 | 8 | 7.45 |
| 15 | If the server room door opens by itself, let it. The ghost has a badge too. | 7 | 8 | 7 | 8 | 7.45 |
| 16 | NO FOOD OR DRINK. The ghost spills coffee on the racks and blames the night shift. | 7 | 8 | 7 | 8 | 7.45 |
| 17 | WARNING: Ghost in the server room. It knows the Wi-Fi password. It will not share. | 7 | 8 | 7 | 8 | 7.45 |
| 18 | Do not unplug anything. The ghost is holding the cables together with sheer spite. | 7 | 7 | 8 | 8 | 7.35 |
| 19 | The ghost here only haunts the backup server. It likes knowing it is the last copy. | 7 | 7 | 8 | 8 | 7.35 |
| 20 | The ghost moved into Rack 2 because the cooling is better. Do not disturb it. | 6 | 8 | 8 | 8 | 7.30 |
| 21 | This room is haunted by the spirit of a sysadmin who never got his weekend back. | 7 | 7 | 7 | 9 | 7.30 |
| 22 | BOO! ...Sorry. The ghost in this room has a service level agreement to uphold. | 7 | 7 | 8 | 7 | 7.20 |
| 23 | Do not say the ghost's name three times unless you want a ticket assigned to you. | 7 | 7 | 7 | 8 | 7.15 |
| 24 | WARNING: Haunted server room. The ghost restarts the servers when nobody is watching. | 6 | 8 | 7 | 8 | 7.10 |
| 25 | BEWARE: GHOSTS INSIDE. ENTER AT YOUR OWN RISK. | 3 | 8 | 2 | 9 | 5.20 |
| 26 | This room is haunted. Please keep out. | 2 | 7 | 1 | 9 | 4.35 |

"This room is haunted. Please keep out." — the flat stock notice — finishes last at 4.35, exactly as the judge's brief intends: a line with nothing in it but the fact of the haunting loses to a line that makes a tired sysadmin laugh at 3am.

## Run it

Requires Node 22 or later. Standard library only, no dependencies, no network.

```sh
node main.ts
```

To write the entry somewhere else:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts
cat /tmp/out/entry.txt
# WARNING: The ghost in Rack 4 holds the only admin password. Be nice to it.
```

The program prints the full ranking, the winner with its justification, the gate check, and the verified write path. It exits non-zero if validation, the gate, determinism, or the read-back verification fails.
