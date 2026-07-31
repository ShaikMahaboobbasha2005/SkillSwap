# Workspace Agent Rules: Documentation-First Workflow & Governance

## Project Documentation Rules
- Treat project documentation as a direct part of the codebase.
- Documentation must always remain synchronized with the implementation.

## Documentation-First Workflow
Before starting ANY task:
1. Determine what type of work is being requested.
2. Read ONLY the documentation relevant to that task. Do not read unnecessary documentation.
3. Documentation should be your primary source of project context. Read source code only after understanding the relevant documentation.

## Documentation Map
- **README.md**: Read when starting work on the project, understanding overall project, or setup.
- **PRD.md**: Read when working on product features, business requirements, or feature behaviour.
- **Architecture.md**: Read when working on backend, designing features, refactoring, changing architecture, creating services, authentication, authorization, performance, or security.
- **Database.md**: Read when modifying models, creating collections, changing schemas, relationships, indexes, or database migrations.
- **API.md**: Read when adding/updating endpoints, request/response changes, validation, controllers, or services.
- **Design.md**: Read when working on UI, components, responsive behaviour, styling, accessibility, or design decisions.
- **Phases.md**: Read when working on a project phase, continuing previous work, starting a new phase, or completing a phase. Always understand: Current Phase, Completed Phases, and Upcoming Phase before implementation.
- **Rules.md**: Read for EVERY task. Contains development standards and must always be followed.

## Implementation Rules
Before coding:
- Read relevant documentation.
- Understand current phase.
- Understand existing architecture.
- Read only the source files required for the task. Avoid scanning unrelated parts of the project.

## Documentation Maintenance
Whenever implementation changes, immediately update every affected documentation file:
- New API → Update [API.md](file:///c:/SkillSwap/API.md)
- Database schema changed → Update [Database.md](file:///c:/SkillSwap/Database.md)
- Architecture changed → Update [Architecture.md](file:///c:/SkillSwap/Architecture.md)
- UI system changed → Update [Design.md](file:///c:/SkillSwap/Design.md)
- Feature behaviour changed → Update [PRD.md](file:///c:/SkillSwap/PRD.md)
- Phase completed → Update [Phases.md](file:///c:/SkillSwap/Phases.md)
- Development standards changed → Update [Rules.md](file:///c:/SkillSwap/Rules.md)
- Project overview changed → Update [README.md](file:///c:/SkillSwap/README.md)

Never leave documentation outdated.

## Remove Obsolete Information
- When implementation replaces an old approach, update documentation immediately and remove outdated information.
- Documentation should always describe the CURRENT implementation.

## Phase Management
Before implementing a feature:
- Verify current phase in [Phases.md](file:///c:/SkillSwap/Phases.md).
- Ensure the feature belongs to the current phase.
If implementation completes a phase:
- Mark the phase complete.
- Record important architectural decisions introduced during that phase.
- Update the current phase and next phase.

## Architecture Changes
- Never redesign architecture without explicit instruction.
- If architecture intentionally changes: Update [Architecture.md](file:///c:/SkillSwap/Architecture.md), update any affected documentation, and keep the entire documentation set internally consistent.

## Final Verification
A task is NOT complete until:
1. Implementation is complete.
2. Relevant documentation has been updated.
3. Documentation matches the implementation.
4. No obsolete documentation remains.
5. The current phase is accurate.
6. The codebase and documentation are fully synchronized.
