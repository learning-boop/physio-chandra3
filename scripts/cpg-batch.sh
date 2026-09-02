#!/usr/bin/env bash
# Run cpg-extract.mjs over the whole CPG set, one guideline at a time.
#
# Sequential on purpose: each run is told which condition ids already exist in
# the region, and `import:conditions` between runs is what makes the previously
# extracted ids visible to the next one. Run them in parallel and two guidelines
# for the same region will pick the same id, and the import (all-or-nothing)
# fails for the whole set.
set -u
CPG="$SCRATCH/cpg"

run () {   # run <region> <pdf basename>
  local region="$1" file="$2"
  echo "════════ $region  <-  $file"
  node --env-file=server/.env scripts/cpg-extract.mjs "$CPG/$file" "$region" --write 2>&1 \
    | grep -E "^  [0-9]+ in|written|UNMATCHED|draft condition|^could not"
  npm run import:conditions >/dev/null 2>&1   # so the next run sees these ids
  echo
}

run lowback  "Low back pain.pdf"
run lowback  "Low back pain exercises.pdf"
run neck     "Neck pain.pdf"
run shoulder "Adhesive capsulitis.pdf"
run shoulder "Rotator cuff tendinopathy 2025.pdf"
run wrist    "CTS.pdf"
run hip      "O.A hip 2025 revision.pdf"
run hip      "Non O.A Hip.pdf"
run hip      "Fracture hip in Elderly.pdf"
run hip      "Hamstring strain in athlets 2022.pdf"
run knee     "Knee Ligament sprain.pdf"
run knee     "Meniscus lesion.pdf"
run knee     "PFPS.pdf"
run knee     "ACL injury prevention.pdf"
run ankle    "Ankle ligament sprains.pdf"
run ankle    "Plantafascitis.pdf"

echo "════════ SKIPPED (no region in this app, or not a condition guideline):"
echo "  Concussion and TBI.pdf        - head/brain, no region"
echo "  Manipulation terminology.pdf  - terminology reference, not a condition"
echo "  Optimize to work after injury.pdf - return-to-work process, not a condition"
echo "  O.A hip.pdf                   - superseded by the 2025 revision"
