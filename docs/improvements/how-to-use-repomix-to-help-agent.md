# How to Use Repomix to Help AI Agents

*A comprehensive guide to using repomix for improving AI agent understanding of codebases*

## What is Repomix?

Repomix is a tool that creates a single-file representation of your entire repository, which can dramatically improve AI analysis and understanding of complex codebases.

### Key Benefits
- **Free and Open Source** - MIT licensed, available on npm
- **Local Processing** - All work done on your machine, no data sent to external servers
- **Privacy Focused** - No network requests, no telemetry, no data tracking
- **Complete Context** - Single file view of entire codebase structure

## Basic Usage

### Installation
```bash
# Install repomix globally
npm install -g repomix
```

### Simple Usage
```bash
# Generate a single file with your entire repo
repomix

# This creates a repomix-output.txt file with your entire codebase
```

### Common Options
```bash
# Include specific file patterns
repomix --include "**/*.ts,**/*.vue,**/*.js"

# Exclude certain directories
repomix --exclude "node_modules,dist,.git"

# Output to a specific file
repomix --output my-repo-analysis.txt

# Include file tree structure
repomix --style plain --include-tree

# Focus on specific directories
repomix src/ docs/
```

## Recommended Usage for Vue 3 + TypeScript Projects

### Optimal Command for This Project Type
```bash
repomix --include "src/**/*.{ts,vue,js},*.{ts,js,json,md}" --exclude "node_modules,dist,.git,coverage,.vscode,public" --output story-starter-context.txt
```

This captures:
- All Vue components and TypeScript files
- Configuration files (package.json, vite.config.ts, tsconfig.json)
- Documentation files (README.md, docs/*.md)
- Excludes build artifacts, dependencies, and IDE files

### Advanced Filtering Examples
```bash
# Focus only on source code
repomix --include "src/**/*.{ts,vue}" --output source-only.txt

# Include tests and source
repomix --include "src/**/*.{ts,vue},**/*.test.{ts,js}" --output with-tests.txt

# Include configuration and docs
repomix --include "*.{json,md,ts,js},docs/**/*.md" --output config-docs.txt
```

## How Repomix Helps AI Agents

### What AI Agents Gain

1. **Complete Context Window**
   - Instead of reading files one by one, agents get the entire codebase structure
   - Eliminates context switching between files
   - Provides full understanding of relationships and dependencies

2. **Better Architecture Understanding**
   - Can see how components import and depend on each other
   - Understands data flow across the entire application
   - Spots patterns, inconsistencies, and architectural decisions

3. **Improved Problem Solving**
   - Can predict side effects of changes more accurately
   - Better debugging through understanding of interconnections
   - More comprehensive suggestions for improvements

4. **Pattern Recognition**
   - Identifies repeated code patterns across the codebase
   - Understands naming conventions and code organization
   - Can suggest consistent approaches based on existing patterns

### Why This Overcomes AI Limitations

**Traditional AI Challenges:**
- Limited context window per interaction
- Can't see relationships between distant files
- Must ask for specific files, leading to incomplete understanding
- Struggles with complex, interconnected systems

**Repomix Solutions:**
- Single file contains all relationships
- Complete picture of architecture and dependencies
- No need to guess which files are important
- Can analyze patterns across entire codebase

## Workflow Recommendations

### Option 1: Periodic Updates (Recommended)
Generate repomix files at key milestones:

```bash
# After each major task completion
repomix --include "src/**/*.{ts,vue,js},*.{ts,js,json,md}" --exclude "node_modules,dist,.git,coverage" --output story-starter-milestone.txt
```

**When to regenerate:**
- After completing each major task (2.1.1, 2.1.2, etc.)
- When adding new files or major refactoring
- Before starting complex tasks that require full context understanding
- When encountering complex interconnected issues

### Option 2: Task-Specific Analysis
Generate focused repomix files for specific purposes:

```bash
# Before authentication work
repomix --include "src/components/*Auth*,src/composables/*auth*,src/types/auth.ts" --output auth-context.txt

# Before UI component work
repomix --include "src/components/**/*.vue,src/assets/**/*" --output ui-context.txt

# Before API integration work
repomix --include "src/lib/**/*,src/types/**/*,src/composables/**/*" --output api-context.txt
```

### Option 3: Debugging Sessions
Generate comprehensive context when troubleshooting:

```bash
# Everything including tests and configs
repomix --include "**/*.{ts,vue,js,json,md}" --exclude "node_modules,dist,.git" --output debug-full-context.txt
```

## Best Practices

### File Naming Conventions
```bash
# Use descriptive, dated filenames
repomix --output "story-starter-$(date +%Y%m%d)-task-2.1.2.txt"

# Or milestone-based naming
repomix --output "story-starter-auth-complete.txt"
repomix --output "story-starter-baseline.txt"
```

### Size Management
- Large projects may generate very large files (>1MB)
- Consider splitting by functional areas for complex projects
- Use specific includes/excludes to focus on relevant code

### Integration with Development Workflow
```bash
# Add to package.json scripts
{
  "scripts": {
    "repomix": "repomix --include 'src/**/*.{ts,vue,js},*.{ts,js,json,md}' --exclude 'node_modules,dist,.git,coverage' --output story-starter-context.txt",
    "repomix:source": "repomix --include 'src/**/*.{ts,vue}' --output source-context.txt",
    "repomix:full": "repomix --exclude 'node_modules,dist,.git' --output full-context.txt"
  }
}
```

Then simply run: `npm run repomix`

## Advanced Concepts and Related Tools

### Complementary Approaches

#### 1. Context Documentation Files
Maintain alongside repomix:
- `.github/copilot-context.md` - High-level project state and relationships
- `docs/architecture.md` - System design decisions
- `docs/development-notes.md` - Current issues and progress

#### 2. Dependency Visualization
```bash
# Use with dependency analysis tools
npm install -g dependency-cruiser
depcruise --include-only "^src" --output-type dot src | dot -T svg > dependencies.svg
```

#### 3. Code Metrics and Analysis
```bash
# Complexity analysis
npm install -g complexity-report
cr --output json src/ > complexity-report.json

# TypeScript analysis
npx ts-prune  # Find unused exports
npx ts-unused-exports tsconfig.json  # Find unused exports
```

### Architecture Documentation Strategy

**Layer 1: Repomix Files**
- Complete codebase snapshots
- Generated at milestones
- Used for comprehensive analysis

**Layer 2: Context Files**
- High-level relationships and state
- Manually maintained
- Updated frequently

**Layer 3: Architecture Docs**
- Design decisions and patterns
- Updated when architecture changes
- Explains "why" not just "what"

### Integration with AI Workflows

#### Pre-Task Assessment Protocol
1. **Generate fresh repomix** if significant changes since last generation
2. **Share repomix file** with AI agent for context
3. **Maintain context file** with current state and recent changes
4. **Use specific includes** for focused analysis

#### Post-Task Documentation
1. **Update context file** with changes made
2. **Regenerate repomix** if major milestone completed
3. **Document lessons learned** for future reference
4. **Archive previous versions** for rollback reference

## Security and Privacy Considerations

### What Repomix Includes
- All source code and configuration files
- Comments and documentation
- File structure and organization
- Import/export relationships

### What to Exclude
```bash
# Always exclude sensitive data
repomix --exclude "node_modules,dist,.git,.env*,*.key,*.pem,secrets/**"
```

### Best Practices for Sensitive Projects
- Use `.repomixignore` file (similar to `.gitignore`)
- Review generated files before sharing
- Consider using specific includes rather than broad excludes
- Be mindful of hardcoded credentials or API keys in comments

## Troubleshooting

### Large File Issues
```bash
# If output is too large, focus on specific areas
repomix --include "src/components/**/*.vue" --output components-only.txt
repomix --include "src/composables/**/*.ts" --output composables-only.txt
```

### Performance Optimization
```bash
# Skip large files
repomix --exclude "**/*.{jpg,png,gif,pdf,zip}" 

# Focus on recent changes
git diff --name-only HEAD~5 | xargs repomix --include
```

### Common Issues
- **Empty output**: Check include/exclude patterns
- **Too much noise**: Add more specific excludes
- **Missing context**: Verify important files are included
- **Performance slow**: Exclude unnecessary file types

## Measuring Effectiveness

### Before/After Comparison
Track AI agent performance:
- **Response accuracy** - Are suggestions more relevant?
- **Context understanding** - Does agent grasp relationships better?
- **Debugging speed** - Faster issue identification?
- **Architecture suggestions** - More comprehensive recommendations?

### Success Metrics
- Reduced need for multiple file reads
- Better prediction of change impacts
- More accurate architectural suggestions
- Faster complex problem resolution

## Related Tools and Concepts

### Similar Tools
- **CodeSee** - Visual codebase mapping
- **Dependency Cruiser** - Dependency analysis and visualization
- **Madge** - Module dependency graph visualization
- **CodeRadar** - Code quality and architecture analysis

### Complementary Practices
- **Architecture Decision Records (ADRs)** - Document why decisions were made
- **Code ownership files** - Track who maintains what
- **API documentation** - Document interfaces and contracts
- **Dependency management** - Keep dependencies up to date and documented

### Future Enhancements
- Integration with IDE extensions
- Automated generation on git hooks
- Team sharing and collaboration features
- Integration with documentation tools

---

## Summary

Repomix is a powerful tool for improving AI agent understanding of complex codebases. By providing complete context in a single file, it overcomes the limitations of traditional file-by-file analysis and enables more accurate, comprehensive assistance.

**Key Takeaways:**
1. **Use periodically** - Generate at milestones, not continuously
2. **Be selective** - Include relevant files, exclude noise
3. **Combine approaches** - Use with context files and documentation
4. **Measure results** - Track improvements in AI assistance quality
5. **Maintain security** - Exclude sensitive data and review outputs

**Recommended Next Steps:**
1. Generate initial baseline repomix file
2. Test effectiveness with current project challenges
3. Establish workflow for regular updates
4. Create complementary context documentation
5. Refine include/exclude patterns based on results
