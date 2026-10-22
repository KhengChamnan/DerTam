# QAOA solver: licensing and provenance review

Status: pending rights-holder and upstream-source confirmation.
This document and the proposed files in this directory do not grant a licence
to qaoa_solver.py or any other existing project material.

## Scope

Issue: https://github.com/KhengChamnan/DerTam/issues/58
File: smart_route/quantum_optimizer/qaoa_solver.py
Recorded Git blob: 62881893890fab23280cf8d752db384ded6be55f

The enquiry covers code and comments for QUBO-to-Ising conversion, QAOA,
sampler and optimiser orchestration, circuit-display construction, and result
handling. It concerns 24 derived PQID entries described by the requester.
The separate route decoder, tourism/customer data, route results, application
services, and imported libraries are outside this enquiry.

## Evidence and credit

The current file matches the recorded blob. No licence, copyright notice,
author credit, or upstream adaptation references were found in the file.
The current repository tree contains no licence or attribution files, and the
root and smart_route READMEs do not supply licensing terms.

The file's path history records five commits under the GitHub account
KhengChamnan. The initial commit records the author name Kheng Chamnan:

| Commit | Date | Recorded change |
| --- | --- | --- |
| eb29ac8bae4090638b65125228690942ce2c1647 | 2025-12-16 | Introduced the file |
| 397ecbd767c96fc0c47290e244fb0ce7130f068e | 2025-12-17 | Reworked QAOA solver implementation |
| c8e70d3e96b190c21929e63befa14f11bbe6dcc7 | 2025-12-18 | Feature-based solver and circuit-display changes |
| c4ce8a9f713557e6376ddc4c1e86decf0f39e6a7 | 2025-12-20 | Sampler compatibility, optimiser tracking and result handling |
| ecee89fab68f73a3dfb3eeb296607467bd47073a | 2025-12-20 | Passed additional traffic information |

Credit supported by this evidence: Kheng Chamnan (@KhengChamnan), recorded
contributor. Commit attribution does not establish sole copyright ownership,
authority to license, or independence from third-party sources.

## Proposed licence

Apache-2.0 is proposed for contributions whose rights holders authorise it.
The complete standard text is in proposed/Apache-2.0.txt, with a proposed
file notice in proposed/qaoa_solver-header.txt.

These are review materials only. They do not apply Apache-2.0 to the file,
the historical blob, or the repository. No copyright holder has been invented.

## Third-party provenance

Qiskit, qiskit-algorithms, qiskit-aer and NumPy are used as dependencies.
Dependency imports do not establish that their implementations or tutorials
were copied. The reviewed file history does not identify original sources for
adapted code or comments. Independent authorship and adaptations remain
unconfirmed; neither should be asserted without evidence.

For each confirmed adaptation, record:
- Original source URL and exact version or commit.
- Affected functions, code blocks, or comments.
- Original author/copyright credit and licence.
- Modifications made here and all applicable retained notices.

If a source is Apache-2.0, retain its applicable copyright/attribution notices,
include its licence, mark modified files, and preserve relevant upstream NOTICE
content when supplied. Check the actual source's terms; do not assume all
Qiskit tutorials or third-party material share one licence.

## Completion steps

1. Establish the actual rights holders and their authority to license the
   relevant contributions; obtain consent where needed.
2. Complete the source inventory above. Where provenance cannot be established,
   keep the affected material outside any grant or replace it with an
   independently implemented contribution whose rights are established.
3. If Apache-2.0 is accepted, apply the completed notice to the authorised
   portions and put the full licence in LICENSES/Apache-2.0.txt. Document any
   portions under different terms instead of relicensing them.
4. Add an express scope statement covering authorised code and comments in
   smart_route/quantum_optimizer/qaoa_solver.py at Git blob
   62881893890fab23280cf8d752db384ded6be55f, and identify all exclusions.
5. Respond to issue 58 with links to the licensing commit, confirmed credits,
   original sources and retained notices. Do not claim PQID inclusion is
   approved: its entries remain subject to the requester's integration review.

Keep the existing classical_fallback identification. Licensing review does not
validate quantum performance. Do not close issue 58 until the licence grant
and provenance questions have actually been resolved.
