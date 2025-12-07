FLOOR 1 – THE CELLS
F1_INTRO_WAKE
Player awakens in the cell.
→ leads to: F1_CELL
→ leads to: F1_CELL_DOOR
F1_CELL
Player explores the starting cell.
→ leads to: F1_CELL_DOOR

F1_CELL_DOOR
The locked or stuck door sequence.
→ leads to: F1_HALLWAY_FIRST_STEP

F1_HALLWAY_FIRST_STEP
First step into hallway.
→ leads to: F1_HALLWAY_AMBIENT
→ leads to: F1_FIGHT

F1_HALLWAY_AMBIENT
Environmental storytelling, tension rises.
→ leads to: F1_FIGHT

F1_FIGHT
Fight with the Floor 1 Warden.
→ leads to: F1_EXIT_TO_F2

F1_EXIT_TO_F2
Player climbs the staircase out of the cells.
→ leads to Floor 2 intro: F2_FLOOR_INTRO

FLOOR 2 – THE SERVANTS’ FLOOR
F2_FLOOR_INTRO
Arrival on Floor 2, new environment.
→ leads to: F2_HUB_CORRIDOR

F2_HUB_CORRIDOR
Branching point for rooms on Floor 2.
→ branches to:
F2_KITCHENS
F2_SERVANT_QUARTERS

F2_KITCHENS
Kitchen discovery and short narrative moment.
→ returns to hub via F2_BRANCH_MERGE

F2_SERVANT_QUARTERS
Servant rooms and dialogue moment.
→ returns to hub via F2_BRANCH_MERGE

F2_BRANCH_MERGE
Shared convergence after any Floor 2 room.
→ leads to: F2_SHADOW_DOPPEL_FIGHT

F2_SHADOW_DOPPEL_FIGHT
Boss/miniboss doppelgänger fight.
→ leads to: F2_MEMORY_CHAMBER (memory shard)

F2_MEMORY_CHAMBER
Player recovers memory fragment.
→ leads to: F2_STAIRS_UP

F2_STAIRS_UP
Exit staircase to Floor 3.
→ leads to: F3_INTRO

FLOOR 3 – THE STUDY / ARCHIVES
F3_INTRO
Entry sequence for Floor 3.
→ leads to: F3_MAIN_HALL

F3_MAIN_HALL
A central hub for Floor 3.
→ branches to:
F3_WORKBENCH
F3_STUDY
F3_READING_ROOM
F3_CORE_ARCHIVE
All paths eventually converge.

F3_WORKBENCH
Tools, diagrams, lore moment.
→ returns to main: F3_MAIN_HALL

F3_STUDY
Study room exploration.
→ returns to main: F3_MAIN_HALL

F3_READING_ROOM
Encounter with books, perhaps pre-fight foreshadow.
→ returns to main: F3_MAIN_HALL

F3_CORE_ARCHIVE
The Archive chamber and miniboss fight.
→ leads to: F3_CURSED_SCHOLAR_FIGHT

F3_CURSED_SCHOLAR_FIGHT
Boss fight of Floor 3.
→ leads to: F3_STAIRS_UP

F3_STAIRS_UP
Exit staircase to Floor 4.
→ leads to: F4_INTRO

FLOOR 4 – THE QUARTERS / PERSONAL HISTORY
F4_INTRO
Arrival on Floor 4.
→ leads to: F4_PATH_CHOICE

F4_PATH_CHOICE
Narrative fork that gives two different rooms to explore.
→ branches to:
F4_CHAPEL
F4_YOUR_QUARTERS
Both reconnect afterward.

F4_CHAPEL
The ritualistic chapel area.
→ leads to: F4_MERGE_CORRIDOR

F4_YOUR_QUARTERS
Your personal room and major memory reveal.
→ leads to: F4_MERGE_CORRIDOR

F4_MERGE_CORRIDOR
Shared convergence corridor.
→ leads to: F4_MEMORY_WRAITH_FIGHT

F4_MEMORY_WRAITH_FIGHT
Boss fight for Floor 4.
→ leads to:
 F4_FINAL_JOURNAL (story beat)

F4_FINAL_JOURNAL
Critical memory reveal, last shard.
→ leads to: F4_STAIRS_UP

F4_STAIRS_UP
Final staircase leading to Floor 5.
→ leads to: F5_INTRO

FLOOR 5 – THE TOWER / DRAVIK
F5_INTRO
Arrival at the tower top where Dravik resides.
→ leads to: F5_FINAL_ROOM

F5_FINAL_ROOM
The ritual hall environment description.
→ leads to: F5_DRAVIK_ENTRANCE

F5_DRAVIK_ENTRANCE
Dravik appears and delivers final speech.
→ leads to: F5_FINAL_BOSS_FIGHT

F5_FINAL_BOSS_FIGHT
Battle with Dravik and final decision.
→ leads to:
RUN_WIN (escape ending)
RUN_DEATH (loop resets / bad ending)

TERMINAL NODES
RUN_WIN
Player defeats Dravik and breaks free.

RUN_DEATH
Player fails or chooses wrong, loop restarts.