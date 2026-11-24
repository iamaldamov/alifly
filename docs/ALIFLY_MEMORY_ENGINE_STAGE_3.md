# ALIFLY MEMORY ENGINE — Stage 3: Learner feedback and insights

## Added in this stage

- Learners can rate each answered practice question as Again, Hard, Good, or Easy before continuing.
- A failed recall can be classified as an unknown cause, letter shape, dots, letter name, pronunciation, meaning, reading, or attention.
- The chosen grade and error category are used by the scheduler when the learner advances to the next question.
- The existing Arabic prompts, answer choices, explanations, and lesson sequence are not changed.
- The progress dashboard shows the number of memory cards, cards currently due, recent answer success rate, and the three lowest-performing skill categories.
- Analytics are derived from the bounded local memory event history. They are device/account-local and do not imply cross-device sync.

## Scheduling behavior

- Again: retry in 10 minutes and reset the successful repetition streak.
- Hard: modestly extend the prior interval and slightly reduce ease.
- Good: follow the 1 / 3 / 7 / 14 / 30-day interval ladder.
- Easy: extend beyond the standard interval and slightly increase ease.
- Error cause is recorded only when the learner selects Again.

The scheduler is a transparent heuristic. It is not a validated model of an individual's forgetting curve.

## Remaining release gates

- Cross-device cloud sync is not enabled. The tracked Firestore rules are not proof of deployed Firebase rules; deployed rules must be checked and tested before adding writes.
- Existing lesson questions still map primarily to recognition/recall. Dedicated pronunciation, listening, vocabulary, and grammar cards require stable curriculum IDs and purpose-built exercises.
- Manual QA on iPhone, account switching, offline behavior, and storage failure still needs to be completed.
- GitHub Actions must pass on the latest PR head before merging or deployment.

## Safety

No existing Arabic text, translations, transliterations, or religious content were edited in this stage. Existing legacy mistake storage remains in place.
