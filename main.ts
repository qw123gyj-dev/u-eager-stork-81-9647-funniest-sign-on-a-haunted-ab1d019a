// Funniest Sign on a Haunted Server Room Door — make.fun bounty
// slug: u-eager-stork-81-9647-funniest-sign-on-a-haunted-ab1d019a
//
// The task: one funny line for the door of a haunted server room, at
// most 120 characters. An AI judge compares entries two at a time against
// a published brief, weighing the criteria in this order:
//
//   1. The line is a sign for the door of a haunted server room, the
//      kind a ghost would tape up — a joke about anything else loses.
//   2. It gets a real laugh in one line, from the collision of office
//      IT life and the supernatural, rather than a pun that needs a
//      second read.
//   3. It sounds like a sign: short, punchy and readable at a glance,
//      the sort of line that fits on a printed sheet.
//   4. The haunting is specific and fresh — a ghost, a cold aisle or a
//      beeping rack used in a way we have not read a hundred times.
//   5. It stays inside the character limit and still reads cleanly
//      aloud, with no filler padding it out.
//
// A line that would make a tired sysadmin laugh at 3am is the target.
// Length for its own sake does not count.
//
// This program is a deterministic entry picker. It holds a hand-written
// list of candidate signs, scores every candidate against the judge's
// five criteria in the judge's own order of importance, picks the best,
// validates it against the sealed gate (UTF-8 text, 1 to 120 characters,
// not only whitespace), writes it to $MAKEFUN_OUTPUT_DIR/entry.txt
// (falling back to /output/entry.txt), reads it back and verifies the
// bytes match.
//
// The door being signed, in one paragraph, so every score below can be
// checked against something real: a server room is a cold, windowless
// box of humming racks, blinking lights and cables, kept at a temperature
// no human enjoys, visited at 3am by a tired sysadmin with a torch and
// a ticket queue. Its ghosts are not the castle kind: they live in the
// cold aisle, they ride the beeping of a failing drive, they hold the
// one admin password nobody wrote down, they answer the on-call phone.
// The joke has to live where those two worlds collide — the supernatural
// behaving like bad IT, and IT behaving like a haunting.
//
// Why a scorer instead of a hard-coded line: the field is judged
// pairwise and blind, and the winning line is the one that survives the
// criteria in order. A scorer forces every candidate to earn its place
// on the same axes the judge uses, and makes the choice reproducible:
// run this program twice and it picks the same line, because there is
// no randomness anywhere in it. The weights below mirror the judge's
// ordering — the laugh first, then sounding like a sign, then freshness,
// then reading cleanly aloud — while the first criterion (a sign for
// the haunted server room door) is a hard gate, not a score: any
// candidate that is not such a sign is rejected before scoring starts.
//
// Node 22, standard library only. No network, no environment secrets,
// no files read from outside this repository.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// One candidate sign, with a score on each of the judge's criteria.
// Every score is an integer from 0 to 10, judged by hand against the
// portrait of the server room above. 10 means the line nails that
// criterion; 0 means it fails it outright.
interface Candidate {
  // The sign itself. Must be a single line, at most 120 characters.
  line: string;
  // Criterion 2: a real laugh in one line, from the collision of office
  // IT life and the supernatural — not a pun that needs a second read.
  laugh: number;
  // Criterion 3: sounds like a sign — short, punchy, readable at a
  // glance, the sort of line that fits on a printed sheet.
  signLike: number;
  // Criterion 4: the haunting is specific and fresh — a ghost, a cold
  // aisle or a beeping rack used in a way we have not read before.
  fresh: number;
  // Criterion 5: stays inside the character limit and reads cleanly
  // aloud, with no filler padding it out.
  clean: number;
  // One line saying why this sign was considered, for the report.
  why: string;
}

// A candidate after scoring, carrying its total and its rank.
interface ScoredCandidate extends Candidate {
  total: number;
  rank: number;
}

// ---------------------------------------------------------------------------
// The gate (from the competition rules, sealed scorer)
// ---------------------------------------------------------------------------

// The gate checks that /output/entry.txt is UTF-8 text of 1 to 120
// characters, not only white space. Only a valid entry goes before the
// judge; an invalid one is listed with 0 and no rate, and takes no prize.
const GATE_MIN_CHARS = 1;
const GATE_MAX_CHARS = 120;

// A candidate must also be one line: no newline characters anywhere.
// A sign taped to a door is read at a glance; a second line is a
// paragraph, not a sign, and the task says one line.
const SINGLE_LINE_PATTERN = /^[^\n\r]+$/;

// ---------------------------------------------------------------------------
// Scoring weights — mirror the judge's ordering
// ---------------------------------------------------------------------------

// The judge weighs the laugh first among the scored criteria, then
// sounding like a sign, then freshness, then reading cleanly aloud.
// The weights sum to 1.00, so the total is on the same 0–10 scale as
// the per-criterion scores.
const WEIGHT_LAUGH = 0.35;
const WEIGHT_SIGN_LIKE = 0.3;
const WEIGHT_FRESH = 0.2;
const WEIGHT_CLEAN = 0.15;

// ---------------------------------------------------------------------------
// Candidates — hand-written, one line each, for this door
// ---------------------------------------------------------------------------

// Twenty-four candidates. Each one was written by hand against the
// portrait above, not generated, and each carries its own justification.
// The list is deliberately mixed: strong contenders, plausible-but-flat
// stock warnings, lines that are funny but do not read like a sign, and
// lines that read like a sign but carry no joke — so the scorer has
// real work to do and the winner has to beat genuine alternatives on
// every axis.
const CANDIDATES: Candidate[] = [
  {
    line: "WARNING: The ghost in Rack 4 holds the only admin password. Be nice to it.",
    laugh: 9,
    signLike: 9,
    fresh: 9,
    clean: 9,
    why: "The whole collision in one line: a supernatural squatter that controls the one credential nobody wrote down, and the sign's advice is to be polite to it. Reads like a real warning, and the laugh lands on the first read.",
  },
  {
    line: "DO NOT REBOOT RACK 4. The ghost inside has 99.99% uptime and a grudge.",
    laugh: 8,
    signLike: 9,
    fresh: 8,
    clean: 9,
    why: "A do-not-touch sign where the ghost is measured like a service — 99.99% uptime, plus a grudge. The SLA joke is fresh and the line is pure sign language.",
  },
  {
    line: "The previous sysadmin still works here. He never clocked out. He never will.",
    laugh: 8,
    signLike: 8,
    fresh: 7,
    clean: 9,
    why: "Three short beats, each one landing a little harder: the haunting is just an employee who never left, which any tired sysadmin recognises at once.",
  },
  {
    line: "PLEASE KNOCK. The ghost in the cold aisle is on call and hates being paged.",
    laugh: 8,
    signLike: 8,
    fresh: 8,
    clean: 8,
    why: "The cold aisle — the room's own geography — plus an on-call ghost that resents being paged. Two worlds colliding in a polite request.",
  },
  {
    line: "This room is haunted by a ghost who only appears during scheduled downtime.",
    laugh: 7,
    signLike: 8,
    fresh: 8,
    clean: 9,
    why: "A ghost that keeps to the maintenance window is a fresh twist, and the line reads like a notice. The laugh is quieter than the top lines, though.",
  },
  {
    line: "DO NOT EXORCISE THE PRODUCTION SERVER. It is the only one that still works.",
    laugh: 8,
    signLike: 8,
    fresh: 7,
    clean: 8,
    why: "An exorcism treated as an unauthorised change to production, with the punchline that the haunted box is the reliable one. Funny, but the ghost is a bystander here, not the actor.",
  },
  {
    line: "The beeping at 3am is not a failing drive. It is Dave. Dave died in 2009.",
    laugh: 8,
    signLike: 7,
    fresh: 9,
    clean: 8,
    why: "The beeping rack — the room's own sound — turns out to be a named colleague, dead since 2009. Specific and fresh, but it reads more like a story than a sign.",
  },
  {
    line: "If the lights flicker, the ghost is just rebooting. Do not touch anything.",
    laugh: 7,
    signLike: 9,
    fresh: 7,
    clean: 9,
    why: "Pure sign language with a calm instruction, and the flicker explained as a reboot. Clean and readable, but the joke is a single gentle shrug.",
  },
  {
    line: "HAUNTED: Enter at your own risk. The ghost has seen your browser history.",
    laugh: 7,
    signLike: 8,
    fresh: 7,
    clean: 8,
    why: "A classic warning shape with a modern threat — the ghost knows what you browsed. It lands, but the browser-history joke has been told in many rooms before this one.",
  },
  {
    line: "The cold aisle is cold because the ghost likes it that way. Wear a jacket.",
    laugh: 7,
    signLike: 8,
    fresh: 8,
    clean: 8,
    why: "The room's own cold explained as a ghost's preference, ending on practical advice. Warm and specific, though the laugh is mild.",
  },
  {
    line: "NO FOOD OR DRINK. The ghost spills coffee on the racks and blames the night shift.",
    laugh: 7,
    signLike: 8,
    fresh: 7,
    clean: 8,
    why: "A house rule whose real culprit is a ghost with office manners — spilling coffee and blaming the night shift. True to server-room life, but the joke needs a beat to assemble.",
  },
  {
    line: "This server room is haunted. Please submit all exorcism requests as a ticket.",
    laugh: 8,
    signLike: 8,
    fresh: 7,
    clean: 8,
    why: "Bureaucracy wins: even the supernatural goes through the ticket queue. A strong collision of IT process and haunting, though the ghost itself is generic.",
  },
  {
    line: "WARNING: Ghost in the server room. It knows the Wi-Fi password. It will not share.",
    laugh: 7,
    signLike: 8,
    fresh: 7,
    clean: 8,
    why: "A warning sign with a petty, human ghost — it knows the password and refuses to share. Readable at a glance, but the Wi-Fi password joke is well worn.",
  },
  {
    line: "Do not unplug anything. The ghost is holding the cables together with sheer spite.",
    laugh: 7,
    signLike: 7,
    fresh: 8,
    clean: 8,
    why: "The cable spaghetti of a real server room, held together by a ghost's spite instead of zip ties. Fresh image, but the line is a touch long for a glance.",
  },
  {
    line: "The ghost here only haunts the backup server. It likes knowing it is the last copy.",
    laugh: 7,
    signLike: 7,
    fresh: 8,
    clean: 8,
    why: "A ghost with a backup strategy — it picked the one server that matters most. Clever and specific, though it reads more like an observation than a sign.",
  },
  {
    line: "If you hear typing and nobody is here, it is the ghost. It is fixing your code.",
    laugh: 8,
    signLike: 7,
    fresh: 7,
    clean: 8,
    why: "The phantom typist turns out to be a helpful colleague from beyond, debugging your code. A real laugh, but the sign shape is weak — it is a note, not a warning.",
  },
  {
    line: "PLEASE DO NOT FEED THE GHOST. It has already eaten three interns and one RAID array.",
    laugh: 8,
    signLike: 8,
    fresh: 8,
    clean: 7,
    why: "A do-not-feed sign, zoo-style, with the body count mixing interns and a RAID array. The collision is strong, but the line is long and the laugh arrives late.",
  },
  {
    line: "This room is haunted by the spirit of a sysadmin who never got his weekend back.",
    laugh: 7,
    signLike: 7,
    fresh: 7,
    clean: 9,
    why: "The haunting as unpaid overtime — a ghost born of a lost weekend. Every sysadmin feels it, but the line is more sad than funny, and the ghost is generic.",
  },
  {
    line: "The ghost moved into Rack 2 because the cooling is better. Do not disturb it.",
    laugh: 6,
    signLike: 8,
    fresh: 8,
    clean: 8,
    why: "A ghost that chose its rack for the air conditioning is a fresh, domestic detail, and the sign shape is clean. The laugh, though, is only a smile.",
  },
  {
    line: "BOO! ...Sorry. The ghost in this room has a service level agreement to uphold.",
    laugh: 7,
    signLike: 7,
    fresh: 8,
    clean: 7,
    why: "A ghost that apologises for scaring you because it has an SLA is a charming collision, but the stuttered opening costs it the at-a-glance punch of a real sign.",
  },
  {
    line: "If the server room door opens by itself, let it. The ghost has a badge too.",
    laugh: 7,
    signLike: 8,
    fresh: 7,
    clean: 8,
    why: "The self-opening door explained as a badged colleague is a neat, quiet joke. It reads like a sign, but the laugh is small and the ghost is doing nothing memorable.",
  },
  {
    line: "WARNING: Haunted server room. The ghost restarts the servers when nobody is watching.",
    laugh: 6,
    signLike: 8,
    fresh: 7,
    clean: 8,
    why: "A proper warning shape with a plausible haunting, but the joke is thin — a ghost that reboots things is barely a joke at all, and it has been told before.",
  },
  {
    line: "Do not say the ghost's name three times unless you want a ticket assigned to you.",
    laugh: 7,
    signLike: 7,
    fresh: 7,
    clean: 8,
    why: "Candyman rules meet the ticket queue: summon the ghost and you get assigned work. Funny in concept, but the line is wordy for a sign and the threat is abstract.",
  },
  {
    line: "The ghost in this room is on the on-call rota. It answers faster than the vendor.",
    laugh: 8,
    signLike: 8,
    fresh: 8,
    clean: 8,
    why: "The ghost as the best member of the on-call rota — faster than the vendor, which every sysadmin believes. Strong collision and fresh, but it reads like a remark rather than a taped-up sign.",
  },
  {
    line: "BEWARE: GHOSTS INSIDE. ENTER AT YOUR OWN RISK.",
    laugh: 3,
    signLike: 8,
    fresh: 2,
    clean: 9,
    why: "It is a sign, and it is short — but it is the generic warning every haunted house has had for a century. No IT in it, no fresh haunting, no joke beyond the word ghost.",
  },
  {
    line: "This room is haunted. Please keep out.",
    laugh: 2,
    signLike: 7,
    fresh: 1,
    clean: 9,
    why: "The flat stock notice: true, short, clean — and completely without a laugh. The brief warns against exactly this, a line with nothing in it but the fact of the haunting.",
  },
];

// ---------------------------------------------------------------------------
// Validation — criterion 1 as a hard gate, plus the sealed gate
// ---------------------------------------------------------------------------

// Check one candidate against every hard rule. Returns a list of reasons
// it fails; an empty list means the candidate is eligible to be scored.
function validateCandidate(candidate: Candidate): string[] {
  const problems: string[] = [];
  const line = candidate.line;

  // Criterion 1: the line must be a sign for the door of a haunted
  // server room. Every candidate in this list was written for that
  // door, so the check is that the line actually mentions the room's
  // world — a ghost, a rack, a server, the cold aisle, the door, or
  // the IT life that lives in it. A line about anything else is
  // rejected before scoring starts.
  const HAUNTED_SERVER_ROOM_PATTERN =
    /ghost|rack|server|cold aisle|sysadmin|reboot|ticket|on-call|drive|wi-fi|admin password|intern|RAID|vendor|backup|haunted|room/i;
  if (!HAUNTED_SERVER_ROOM_PATTERN.test(line)) {
    problems.push(`"${line}" is not a sign for a haunted server room door`);
  }

  // Must be a single line: no newline characters.
  if (!SINGLE_LINE_PATTERN.test(line)) {
    problems.push(`"${line}" is not a single line`);
  }

  // Sealed gate: 1 to 120 characters.
  const length = [...line].length;
  if (length < GATE_MIN_CHARS) {
    problems.push(`"${line}" is shorter than ${GATE_MIN_CHARS} character`);
  }
  if (length > GATE_MAX_CHARS) {
    problems.push(`"${line}" is ${length} characters, over the ${GATE_MAX_CHARS} limit`);
  }

  // Sealed gate: not only whitespace.
  if (line.trim().length === 0) {
    problems.push(`"${line}" is only whitespace`);
  }

  // Every per-criterion score must be an integer in 0..10.
  const scores: Array<[string, number]> = [
    ["laugh", candidate.laugh],
    ["signLike", candidate.signLike],
    ["fresh", candidate.fresh],
    ["clean", candidate.clean],
  ];
  for (const [name, score] of scores) {
    if (!Number.isInteger(score) || score < 0 || score > 10) {
      problems.push(`"${line}" has an out-of-range ${name} score: ${score}`);
    }
  }

  return problems;
}

// Validate the whole candidate list up front. Any invalid candidate is
// dropped with a warning; the program never scores a line that cannot
// legally be entered.
function eligibleCandidates(candidates: Candidate[]): Candidate[] {
  const kept: Candidate[] = [];
  for (const candidate of candidates) {
    const problems = validateCandidate(candidate);
    if (problems.length === 0) {
      kept.push(candidate);
    } else {
      for (const problem of problems) {
        console.warn(`[drop] ${problem}`);
      }
    }
  }
  if (kept.length === 0) {
    throw new Error("No eligible candidates remain after validation.");
  }
  return kept;
}

// ---------------------------------------------------------------------------
// Scoring — the judge's criteria, in the judge's order of importance
// ---------------------------------------------------------------------------

// Score one candidate. The total is the weighted sum of the four scored
// criteria; the weights mirror the judge's ordering (the laugh, then
// sounding like a sign, then freshness, then reading cleanly aloud).
// Rounded to two decimals so the report is readable and the ordering
// is exact.
function scoreCandidate(candidate: Candidate): number {
  const total =
    candidate.laugh * WEIGHT_LAUGH +
    candidate.signLike * WEIGHT_SIGN_LIKE +
    candidate.fresh * WEIGHT_FRESH +
    candidate.clean * WEIGHT_CLEAN;
  return Math.round(total * 100) / 100;
}

// Score every eligible candidate and rank them. The sort is fully
// deterministic: total descending, then line ascending (plain code-unit
// order), so two runs can never disagree and no tie is left to chance.
// This matches the competition's own spirit — its tie-breaks are
// deterministic too, and nothing is decided by chance.
function rankCandidates(candidates: Candidate[]): ScoredCandidate[] {
  const scored: ScoredCandidate[] = candidates.map((candidate) => ({
    ...candidate,
    total: scoreCandidate(candidate),
    rank: 0,
  }));
  scored.sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total;
    }
    if (a.line < b.line) {
      return -1;
    }
    if (a.line > b.line) {
      return 1;
    }
    return 0;
  });
  scored.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  return scored;
}

// Prove the choice is deterministic: rank the field a second time from
// scratch and demand the identical ranking. The program has no randomness,
// no clock and no environment input in its scoring path, so a second run
// must agree exactly; if it ever does not, something is broken and the
// program fails loudly instead of writing an entry it cannot reproduce.
function verifyDeterminism(candidates: Candidate[], firstRanking: ScoredCandidate[]): void {
  const secondRanking = rankCandidates(candidates);
  if (secondRanking.length !== firstRanking.length) {
    throw new Error("Determinism check failed: ranking lengths differ between runs.");
  }
  for (let i = 0; i < firstRanking.length; i++) {
    const first = firstRanking[i];
    const second = secondRanking[i];
    if (first.line !== second.line || first.total !== second.total || first.rank !== second.rank) {
      throw new Error(
        `Determinism check failed at rank ${i + 1}: first run ${first.line} (${first.total}), ` +
          `second run ${second.line} (${second.total}).`,
      );
    }
  }
  console.log(`[check] determinism verified: two independent rankings agree on all ${firstRanking.length} candidates`);
}

// ---------------------------------------------------------------------------
// Gate check on the winning line, exactly as the sealed scorer states it
// ---------------------------------------------------------------------------

// Re-check the final entry text against the gate as a standalone string,
// the way the sealed scorer will see it: UTF-8 text, 1 to 120 characters,
// not only whitespace. Returns the problems found, if any.
function gateCheckEntry(text: string): string[] {
  const problems: string[] = [];
  const chars = [...text];
  if (chars.length < GATE_MIN_CHARS) {
    problems.push(`entry is ${chars.length} characters, below the minimum of ${GATE_MIN_CHARS}`);
  }
  if (chars.length > GATE_MAX_CHARS) {
    problems.push(`entry is ${chars.length} characters, over the maximum of ${GATE_MAX_CHARS}`);
  }
  if (text.trim().length === 0) {
    problems.push("entry is only whitespace");
  }
  if (!SINGLE_LINE_PATTERN.test(text)) {
    problems.push("entry is not a single line");
  }
  return problems;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

// Resolve the output directory: $MAKEFUN_OUTPUT_DIR when set, otherwise
// the harness default /output. The entry file is always entry.txt.
function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv !== undefined && fromEnv.trim().length > 0) {
    return fromEnv;
  }
  return "/output";
}

// Write the winning line, read it back, and verify the bytes match what
// was written. A mismatch is fatal: the program exits non-zero rather
// than submitting an entry it cannot prove is correct.
function writeAndVerifyEntry(line: string, dir: string): string {
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "entry.txt");
  writeFileSync(path, line, "utf8");
  const readBack = readFileSync(path, "utf8");
  if (readBack !== line) {
    throw new Error(
      `Verification failed: read back ${JSON.stringify(readBack)} but wrote ${JSON.stringify(line)}.`,
    );
  }
  const bytes = Buffer.byteLength(readBack, "utf8");
  console.log(`[write] ${path} (${bytes} bytes): ${JSON.stringify(readBack)}`);
  return path;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

// Print the full ranking table so the choice is auditable: every
// candidate, its four criterion scores, its weighted total and its rank.
function printRanking(ranked: ScoredCandidate[]): void {
  console.log("");
  console.log("Ranking (weights: laugh 0.35, sign-like 0.30, fresh 0.20, clean 0.15)");
  console.log("rank  laugh  sign  fresh  clean  total  line");
  console.log("----  -----  ----  -----  -----  -----  ----");
  for (const entry of ranked) {
    const rank = String(entry.rank).padStart(4, " ");
    const laugh = String(entry.laugh).padStart(5, " ");
    const signLike = String(entry.signLike).padStart(4, " ");
    const fresh = String(entry.fresh).padStart(5, " ");
    const clean = String(entry.clean).padStart(5, " ");
    const total = entry.total.toFixed(2).padStart(5, " ");
    console.log(`${rank}  ${laugh}  ${signLike}  ${fresh}  ${clean}  ${total}  ${entry.line}`);
  }
  console.log("");
}

// Print the winner's justification: the line, its scores, and why it won.
function printWinner(winner: ScoredCandidate, runnerUp: ScoredCandidate | undefined): void {
  console.log(`Winner: ${winner.line} (total ${winner.total.toFixed(2)})`);
  console.log(`  laugh ${winner.laugh}, sign-like ${winner.signLike}, fresh ${winner.fresh}, clean ${winner.clean}`);
  console.log(`  Characters: ${[...winner.line].length} (limit ${GATE_MAX_CHARS})`);
  console.log(`  Why: ${winner.why}`);
  if (runnerUp !== undefined) {
    const margin = Math.round((winner.total - runnerUp.total) * 100) / 100;
    console.log(`  Runner-up: ${runnerUp.line} (${runnerUp.total.toFixed(2)}), margin ${margin.toFixed(2)}`);
  }
  console.log("");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log("Funniest Sign on a Haunted Server Room Door — deterministic entry picker");
  console.log("Competition: u-eager-stork-81-9647-funniest-sign-on-a-haunted-ab1d019a");
  console.log(`Candidates considered: ${CANDIDATES.length}`);

  // 1. Hard gates first: criterion 1 (a sign for the haunted server
  // room door) and the sealed gate (1–120 chars, not only whitespace,
  // single line). Nothing ineligible is ever scored.
  const eligible = eligibleCandidates(CANDIDATES);
  console.log(`Eligible after validation: ${eligible.length}`);

  // 2. Score and rank on the judge's four scored criteria.
  const ranked = rankCandidates(eligible);
  verifyDeterminism(eligible, ranked);
  printRanking(ranked);

  // 3. The winner is the top-ranked candidate.
  const winner = ranked[0];
  const runnerUp = ranked[1];
  printWinner(winner, runnerUp);

  // 4. Gate-check the winning line exactly as the sealed scorer will.
  const gateProblems = gateCheckEntry(winner.line);
  if (gateProblems.length > 0) {
    for (const problem of gateProblems) {
      console.error(`[gate] ${problem}`);
    }
    process.exit(1);
  }
  console.log(`[gate] winner passes: ${[...winner.line].length} chars, single line, not whitespace`);

  // 5. Write it, read it back, verify the bytes match.
  const dir = outputDir();
  writeAndVerifyEntry(winner.line, dir);

  console.log(`Done. Entry: ${winner.line}`);
}

main();
