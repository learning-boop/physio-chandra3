# Clinical content — how to feed the assessment

Everything a patient sees in the assessment comes from this folder. Chandra
writes the clinical content; the code only carries it.

```
content/
  regions/        one file per body region — red flags, questions, test patients
    _TEMPLATE-region.md
    _EXAMPLE-lowback.md
  conditions/     one file per condition — pointers + patient text
    _TEMPLATE.md
  pain-patterns/  pain-pattern records and the spec they follow
    _PROMPT.md
    _SPEC-the-shape-of-pain.md
```

Files starting with `_` are templates, examples and instructions, never data.

## The order that works

**Region first, then its conditions.** A condition is matched through the
answers in its region, so the region's questions have to exist before a
condition can point at them.

1. Copy `regions/_TEMPLATE-region.md` → `regions/lowback.md` and fill it in.
   `regions/_EXAMPLE-lowback.md` shows a finished one.
2. Say "the low back region is ready". It gets built, checked and tested
   against the test patients in the file, and you get a pass/fail report.
3. Then send that region's conditions, one per file:
   `conditions/lowback-<id>.md`, copied from `conditions/_TEMPLATE.md`.
   Each one is imported and tested the same way.
4. Move to the next region.

## Rules that keep it working

- **Answer text is the link.** A condition points at answers by their exact
  words. Change an answer's wording and every condition that uses it must
  change too — you'll be told which ones break.
- **Keep answers distinct.** Overlapping answers ("pain into the leg" and
  "pain below the knee") blur the scoring.
- **Up to 8 questions per region.** The patient is shown at most 5 of them,
  chosen by their earlier answers.
- **Tiers decide safety, not the AI.** `emergency` → 911 and no booking;
  `urgent` → physician first, booking offered afterwards.
- **Test patients are the proof.** 3–5 per region, including one red-flag case
  and one look-alike that must NOT be matched.

## Checks

```bash
npm run import:conditions   # turn condition files into site data
npm run check:data          # every condition can actually be reached
npm run check:accuracy      # simulated patients reach the right condition
npm run check:patterns      # drawing, referral, pain-type and safety rules
npm run build
```

Word documents are fine to write in — they can be read and converted. Plain
text or Markdown is simplest, because it is what the site reads directly.
