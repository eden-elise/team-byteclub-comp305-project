# BYTECLUB – Narrative Overview

## 1. Core Premise

**Title:** BYTECLUB
**Setting:** Castle Nocturne – a decaying vampire fortress trapped in a time loop.
**Player Character:** *The Apprentice* – once Lord Dravik’s eager assistant, now his favorite experiment.

You wake on the stone floor of a prison cell deep beneath Castle Nocturne, with no memory of who you are or how you got there. A sigil is burned into your wrist: an ouroboros made of teeth.

Every time you die in combat or collapse from terror, you wake up again in the same cell. The castle’s details shift from run to run, but the same **five floors** always lie between you and the ritual hall at the top.

As you climb, Dravik’s minions treat you with an eerie familiarity: wardens, stitched constructs, memory-siphoning shades. They speak as if they’ve seen you do this before—because they have.

---

## 2. The Truth (What the Player Gradually Learns)

* You were once Lord Dravik’s **willing apprentice**, seeking a way to rewrite your own painful past.
* Together you designed a **memory-erasure ritual** that cuts memories from a soul and bottles them for study.
* When you hesitated to use strangers as test subjects, you **volunteered yourself**.
* The ritual “worked too well”: now Dravik resets you over and over, tweaking the experiment each loop.
* Castle Nocturne is effectively a **lab maze** built around this ritual: cells as test chambers, sigils as containment circles, minions as data collectors.

Runs are **canon**. Every failure is just another entry in Dravik’s experiment log.

---

## 3. Run Structure & Gameplay Loop

Each run follows the same high-level pattern:

1. **Wake in the cell on Floor 1** with no memory.
2. **Explore & fight** through 5 themed floors of Castle Nocturne.
3. **Collect memory shards** in special rooms (one per floor).
4. **Reach the ritual hall** and confront Lord Dravik.
5. Make a **final choice**:

    * Destroy him and break the loop.
    * Rejoin him and be reset again (bad “loop” ending).
6. **Die / collapse / choose to rejoin** → reset to Floor 1 with your meta-progress (unlocked memories) intact.

Mechanically, exploration is **entirely text-based** (Twine-style passages and choices) with battles handled by the combat system. There is no top-down movement; “movement” is represented as narrative choices between rooms.

---

## 4. Memory Shards & Narrative Variants

Scattered through the castle are **memory shards**—crystallized fragments of your erased past. They:

* Are unlocked by **story events** (reaching a floor, winning a boss fight, choosing an option).
* Persist **between runs**.
* Do **not** open new routes or change the map.
* Instead, they change **what you remember**:
    * New internal monologue.
    * Variant enemy lines.
    * More specific, personal descriptions of sigils, experiments, and Dravik.

Implementation wise: memory shards set **boolean flags** (e.g., `mem_first_sigil`, `mem_apprentice`). Dialogue checks those flags and swaps in variant lines, but always proceeds to the **same next state**.

Example:

* Before shard:

  > “The symbols mean nothing to you.”

* After shard:

  > “You recognize containment circles you helped design. Each cell is a test chamber.”

---

## 5. Floor Structure (Story Overview)

Each floor has a clear **space**, **story beat**, **boss**, and **memory shard**.

### Floor 1 – Awakening Cells

* **Space:** prison cells, chains, sigils carved into stone, basic undead wardens.
* **Visual hook:** lantern light, iron masks, chalk circles, hovering shard.
* **Story beats:**
    * Wake on cold stone in a half-open cell with no memory.
    * See sigils carved into walls that *feel* familiar.
    * Fight a **Warden Shade**—a tall, chained figure in an iron mask.
    * Discover a memory shard room: a chalk circle and a hovering glass fragment pulsing with light.
    * Touch the shard and see a flash of memory: you and Dravik in a lab; he praises your sigil; you carve it into a subject’s arm.
* **Memory shard:**
    * **Shard 1 – “The First Sigil”**
    * Flag: `mem_first_sigil` (and/or `mem_apprentice`/`mem_ritual` as needed).
    * Unlocks lines that reveal you designed the sigil burned into your wrist.
* **Reveal:**
    * You weren’t randomly cursed. The sigil—and the ritual—are **your own work**.

---

### Floor 2 – Servants’ Floor & Mirror Hall

* **Space:** kitchens, servant quarters, trophy hall, cracked mirror corridor.
* **Story beats:**
    * Servants speak as if you used to give orders here.
    * Environmental hints that the routines of the servants haven’t changed between loops—only you forget.
    * Boss: **Shadow Doppel** – a loyal version of you, acting as Dravik’s perfect apprentice.
* **Memory shard:**
    * **Shard 2 – “The Willing Apprentice”**
    * Confirms you **came to Dravik willingly** seeking power and escape from your past.
* **Reveal:**
    * You were not kidnapped or forced. You asked for this.

---

### Floor 3 – Study & Archives

* **Space:** dusty library stacks, lab benches, occult diagrams, locked archives.
* **Story beats:**
    * Discover journals and diagrams in your handwriting warning:

      > “If he finds me again, he will wipe my mind clean.”
    * See ritual blueprints for memory extraction, annotated with both your and Dravik’s notes.
    * Boss: **Cursed Scholar** – another apprentice driven mad, accusing you of co-creating the ritual.
* **Memory shard:**
    * **Shard 3 – “Co-Author of Oblivion”**
    * Confirms you **co-designed** the memory-wipe ritual and fine-tuned the castle’s sigil network.
* **Reveal:**
    * You aren’t just a victim of the ritual—you’re one of its architects.

---

### Floor 4 – Grand Hall & Private Quarters

* **Space:** bannered halls, private corridors, chapel, your old bedroom and writing desk.
* **Story beats:**
    * Explore **your own quarters**: old notes, personal items, previous escape plans.
    * Final journal pages confirm:

        * You already tried to flee.
        * Dravik caught you and reset you.
        * You’ve looped many, many times.
    * Boss: **Memory Wraith** – a creature made from fragments of your past selves and prior runs.
* **Memory shard:**
    * **Shard 4 – “The Endless Loop”**
    * Shows multiple prior attempts, all ending with your capture and reset.
* **Reveal:**
    * This is not your first escape attempt. You are trapped in an **ongoing loop**.

---

### Floor 5 – Tower Stairs & Battlements

* **Space:** narrow spiral stairs, outer battlements, dawn just visible on the horizon, ritual hall.
* **Story beats:**
    * Slow, tense approach up the tower; castle “remembers” you.
    * Enter the ritual hall: mirrors, chains, blood-lit sigils, the central apparatus where you once volunteered.
    * Final confrontation with **Lord Dravik**.
* **Endings:**

    * **Destroy Dravik (True Ending):**
        * You shatter the apparatus and kill him.
        * The loop breaks; the castle begins to unravel.
        * Future runs (if allowed) may be framed as “echoes” or harder modes, but canonically you’re free.
    * **Rejoin Him / Fear Collapse (Loop Ending):**
        * You accept his offer or break under fear.
        * Dravik welcomes you back as his apprentice.
        * He straps you into the machine again and resets you.
        * You return to Floor 1 with a subtle new line or two hinting that **some part of you remembers choosing this**.

---

## 6. Tone & Themes

* **Tone:** gothic, psychological, mildly sarcastic inner voice once memories return.
* **Key themes:**
    * Responsibility vs. victimhood – you are both the experimenter and the subject.
    * Identity and memory – who are you without your past?
    * Cycles of harm – you built a system you can’t easily escape.
