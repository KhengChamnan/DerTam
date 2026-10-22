# QAOA solver: licence, credit and provenance

## Licence grant and historical coverage

At the maintainer's direction, Kheng Chamnan grants Apache-2.0 permissions for
all contributions in smart_route/quantum_optimizer/qaoa_solver.py that he owns
or is authorised to license. This expressly includes the covered code and
explanatory comments in the recorded Git blob
62881893890fab23280cf8d752db384ded6be55f and subsequent covered contributions.

The full licence text is in ../../LICENSES/Apache-2.0.txt.
This statement supersedes the earlier proposed-only status for the covered
contributions. The files under proposed/ are historical preparation materials,
not the operative licence notice.

This grant covers only rights the grantor owns or is authorised to grant.
It neither relicenses third-party material nor establishes ownership of
unverified portions. It does not assert copyright in material that is not
eligible for copyright. It is not a repository-wide licence.

## Scope and exclusions

Related enquiry: https://github.com/KhengChamnan/DerTam/issues/58

The enquiry concerns QUBO-to-Ising conversion, QAOA/sampler and optimiser
orchestration, circuit-display construction, and result handling, including
comments, in the file above.

The separate route decoder, tourism/customer data, route results, application
services, and imported libraries are outside this grant. Third-party material
remains subject to its own terms. No rights in such material are granted here.

## Credit and source

Project contributor credit: Kheng Chamnan (@KhengChamnan).
Project source: https://github.com/KhengChamnan/DerTam

The maintainer reports using Cursor for development assistance. That identifies
a development tool, not an upstream source or assurance of independent
authorship. Specific prompts, models, and generation records were not supplied.

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

## Third-party provenance: still unverified

Qiskit, qiskit-algorithms, qiskit-aer and NumPy are used as dependencies.
Importing a library does not establish copying from its implementation,
examples, or tutorials. The reviewed file history did not identify sources for
adapted implementations or comments. No claim is made that all material is
original, or that there are no third-party adaptations.

For each identified adaptation, record the upstream URL and version/commit,
affected functions or comments, original author and copyright credit, licence,
modifications, and applicable retained notices. Do not invent upstream sources.

For Apache-2.0 adaptations, include the licence, retain relevant copyright and
attribution notices, mark modifications, and reproduce applicable upstream
NOTICE content where supplied. Verify the actual source terms.

The recorded version's ownership and upstream provenance have not been fully
verified. This scoped grant does not by itself clear the entire file for
redistribution. PQID must review its relevant excerpts and may need further
permissions or exclusions before including any of the 24 derived entries.

## Remaining review

Identify any upstream adaptations and any additional rights holders, retain
their terms, and document permissions or exclusions for the affected portions.
Keep issue 58 open until the requester has the necessary source and licensing
information. Licensing does not validate quantum performance; preserve the
existing classical_fallback identification.
