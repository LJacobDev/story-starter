technical requirements (test driven development version)

Story Starter

features:

- story starter allows a user to sign up and sign in using email and password, with a confirm email link and callback.  the callback redirect should be something like 'ljacobdev.github.io/story-starter/' or a url somewhere in that domain

- story starter has a grid of story cards that show any public stories made, as well as any private ones made by the currently authenticated user

- stories can be searched for by title, genre, description, and filtered by type (movie summary, short story, tv commercial scenario, etc), date created, and 'is private"

- there is a button to press called "generate new story" which brings up a form that allows a user to type in 'tag like' elements to certain fields:  characters, themes, important plot points to include

- the user might type character name and then explain their role (protagonist, antagonist) as the character tags

- the user might type in theme tags like "comedy", "adventure", "thriller"

- the user might type in plot points like "make sure the protagonist and antagonist have a meeting early in the story where they could have averted the conflict but failed to"

- these tags and metadata will be sent as a well shaped prompt to gemini 2.5 flash api calls, which will instruct gemini to create high quality stories that adhere to the conditions of the tags provided by the user

- the front end will tell gemini to reply in json format, but the front end will still need to parse extra characters out of the reply, such as backtick wrappers around the json

- the user can select types of stories to produce, including things like "short story" which provides a story of up to 2000 words, or "movie summary" which provides an overview for a movie story that writers could use as a starting point to create something more from it, or "tv commercial" where the story describes brief shots and actions that can happen to demonstrate a product

- the story cards can be clicked on to view the story details on a form that appears that allows easier viewing of the full text, and also allows editing and deleting of any story that was made by the currently authenticated user

- there is also the ability to share a link to any story that the user can see

- also enable stories to have an 'image' field that allows them to show an image that the user can upload, or link as a url.  But keep in mind and in the plans that it is intended that after the main app is working, we want to add the ability to prompt a text to image generation api to get potential story cover images, but this is optional and only will get addressed once the main project is able to work


requirements:
- use test driven development, meaning that before each feature is implemented, unit or integration tests are first created for it, then the implementation is done and it checks whether the tests pass.  either have a testing framework running on watch mode, or make a vscode task that runs npm run test upon pressing ctrl+shift+b
- build the project in an iterative way that logically builds from a start to completed point in small steps that are manageable, but which move the project forward meaningfully at each step.  
- at each step, explain how to check whether the step taken has worked successfully or needs fixing before moving to the next one
- use shadcn ui components wherever practical in order to have a great looking ui without having to directly write components and animations
- use vue3 with the composition api, tailwindcss, and typescript
- this will be hosted on github pages, so have a github actions workflow that runs NON JEKYLL build steps using vite, and deploys to github pages
- this app will use a supabase backend, storing the secrets in a local .env file that is included in .gitignore.  the developer will provide the url and anon key when making the .env file
- this app will be able to contact gemini api by using edge function 'gemini-proxy' to write prompts that are shaped by the frontend, then the frontend is also responsible to parse the reply and handle any errors gracefully
- remember at the end of implementing the main application, to do audits of things like keyboard navigation accessibility, and user experience improvements once the main functions are working



When we get to implementing task 4.1.1, I'd like to revisit the idea of breaking it into smaller steps that are more likely to succeed, since you said that it is quite complex as it is now



## Testing and Quality Assurance Strategy

### Unit Testing
- Test individual components in isolation
- Mock external dependencies (Supabase, APIs)
- Test edge cases and error scenarios
- Maintain >80% code coverage

### Integration Testing
- Test component interactions
- Test authentication flows
- Test story generation end-to-end
- Test database operations

### End-to-End Testing
- Test complete user workflows
- Test across different browsers
- Test responsive design
- Test accessibility features

### Performance Testing
- Test with large datasets
- Monitor bundle size
- Test loading performance
- Optimize critical rendering path

---

## Success Metrics

### Technical Metrics
- All tests pass consistently
- TypeScript compilation with no errors
- Accessibility audit scores >95%
- Lighthouse performance score >90%

### User Experience Metrics
- Smooth interactions with no blocking operations
- Clear error messages and loading states
- Responsive design across all device sizes
- Intuitive navigation and workflows

### Code Quality Metrics
- Clean, maintainable TypeScript code
- Proper separation of concerns
- Reusable components and composables
- Comprehensive error handling

---

## Conclusion

This prompt plan ensures a systematic, test-driven approach to building the Story Starter application. Each phase builds upon the previous work while maintaining high code quality and user experience standards. The incremental approach allows for early testing and validation of features, reducing the risk of integration issues and ensuring a polished final product.







## Pre-Task Assessment Protocol

Before implementing any task, GitHub Copilot must:

1. **State Current Understanding**:
   - "I can see that [current state of project]"
   - "The last working version had [specific features working]"
   - "I understand this task requires [specific changes]"

2. **Confidence Assessment**:
   - "My confidence level for this task is X/10 because [specific reasons]"
   - "Potential risks I see: [list specific risks]"
   - "I will need to modify these files: [specific file list]"

3. **Complexity Check**:
   - "This task appears to be [simple/moderate/complex]"
   - "If complex: I recommend breaking this into smaller subtasks: [list them]"
   - "I can handle this complexity: [yes/no with reasons]"
   - "If the task is simple, I can perform the prompt as given"
   - "If the task is not simple, instead of performing the prompt, I do not perform the prompt yet, but instead I give a text reply that gives the prompt's goals and instructions but broken into smaller, more manageable sub prompts to do one at a time.  If any of those sub prompts are themselves not simple, I break those ones down into nested sub prompts, and provide the text of this new set of prompts so that the developer may go paste it in their updated prompt plan file."

4. **Verification Plan**:
   - "I will test each change by [specific method]"
   - "I will tell the developer how they can manually test the change [by doing these actions]"
   - "Success criteria: [measurable outcomes]"
   - "Rollback plan: [if this fails, do X]"

5. **Context Reference Files**:
    - "I will read .github/copilot-context.md for a current understanding of this project's context, state, goals, and everything needed to understand the relationships between the different parts and the histories of how they got to be the way they are"
    - "On each change, I will provide a fully new set of context and relationship data that can be pasted overtop of the previous copilot-context.md file.  This will help the developer read diffs between changes in order to track the evolution of it and be able to make edits to it to correct things"

## Mandatory Pre-Change Checklist

- [ ] Identify the exact files that need changes
- [ ] Make ONE change at a time
- [ ] Test after each change before proceeding

If any of these fail, STOP and ask for help rather than making assumptions.






## Optimal Workflow with Repomix:

Initial Generation - Create baseline repomix file

Task Completion Updates - Regenerate after each completed task

Complex Task Preparation - Generate fresh repomix before starting complex tasks like 4.1.1

Debugging Sessions - Generate when encountering complex interconnected issues


## Context Reference Strategy:

### Based on the copilot instructions, I should also maintain copilot-context.md. The optimal approach would be:

Repomix - Complete codebase snapshot for complex analysis

Copilot-context.md - High-level project state, relationships, and recent changes

Combined approach - Use repomix for deep understanding, context.md for ongoing state tracking


Github copilot should update .github/copilot-context.md with information in this format:

# Copilot Working Memory Reference

## Current Project State
- **Last Known Good State**: [Commit hash and description]
- **Currently Working**: [What we're implementing now]
- **Last Test Results**: [Pass/fail count and key issues]
- **Known Issues**: [List of problems we're aware of]

## Key File Relationships
- `useAuthForm.ts` depends on: [list dependencies]
- `SignInForm.vue` uses: [list what it imports/uses]  
- Authentication flow: [trace the data flow]

## Recent Changes Made
- [Date]: Modified [files] to [do what]
- [Date]: Fixed [issue] by [method]

## Next Steps Plan
1. [Specific next action]
2. [How to verify it worked]
3. [What to do if it fails]

## Complexity Warning Signs
- [ ] More than 5 files need changes
- [ ] Circular dependencies detected
- [ ] Test failure cascade (one change breaks multiple tests)
- [ ] Can't predict impact of changes

## assumptions about the project that changed when new things were learned
- [initial assumption]
- [new information learned by testing that assumption]

## Human parseable summary of state and insights derived from reading most recent repomix file
- include anything else useful from the latest repomix file that wasn't covered by the above sections

*Update this file copilot-context.md before and after each major task*
*the developer will look at the diffs on this file and make edits and corrections*
