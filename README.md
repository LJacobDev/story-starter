# Story Starter

A project for practicing a code gen workflow. Users can give character or story elements to an LLM and get story ideas they can use as a starting point to help them think of ideas.

It will be hosted on [GitHub Pages](https://ljacobdev.github.io/story-starter)


Several 'prompt plan' files were generated because 4o was initially being too brief, and a few attempts were made at improving it until I had claude sonnet 4 make the prompt plan instead.  This was because I saw in previous practice that claude sonnet generated much more thorough and detailed prompt plans, and it seemed like a good idea to have claude do it because it was also going to be the agent that would receive the prompts and implement the plan, and this allowed it to optimize the prompts for it own success.

I might do multiple version of this app, using one or another prompt plan, to see if one method is faster and still succeeds, or whether the more thorough one turns out better even if it takes longer.


The purpose of doing this project is to get practice with agentic coding, to stress test what it's able to do, and to get familiar with its strength and limitations.  

The code and tests are not being deeply scrutinized in this project, and the main concern is with getting the high level functionality and appearance to work.

Some of the commits will have unusually long commit messages, but to help with better tracking the thoughts at each step.

Next I will want to iterate on this kind of project again to start focusing on code organization and quality.

This workflow is attempting to rely mainly on prompts to get the work done, with infrequent human intervention, to see whether a careful workflow and prompt plan is able to achieve results where the agent does most of the activity.


## Current state

Phase 4 is complete, which means that stories can be generated and saved

There are many parts of the app that are implemented but not working correctly yet

### Things to fix or polish

#### Making sure all UI components are smooth and fully functional

Getting core functionality was being prioritized, and things that need improvements in UI / UX will be looked at after that.

Examples of pending issues:  story cards can't be clicked on or viewed like they're meant to be, many of the buttons need styling, form fields need keyboard navigation improvements, image upload and storage and display needs to be made to work, and more.



## Strengths of the LLM agent in this project

Helping to create specs and implementation plans, and keeping track of goals and things learned.

Helping to summarize broad and mutli-faceted context in a way that can help the developer understand and keep track of priorities.

## Limitations of the LLM agent in this project

Claude Sonnet 4 jumps on problems confidently, makes long explanations about why it thinks it will easily solve them, and takes a long time to work on them.  After doing all this, it still fails to solve the tasks and often makes things worse while trying.

GPT-5 mini seemed to handle these situations better, possibly because of it having a larger context window, however it also would get caught in cyclical error traps that required reverting to a prior commit and convincing it to go about the problem in a different way.



## Model change: Claude Sonnet 4 taken out as implementing agent at Phase 2 and replaced with GPT-5 mini

For whatever reason, simply switching over from claude sonnet 4 to gpt-5 mini was enough to get things back on track.  Somehow gpt-5 mini was able to look at things and figure out solutions to the problems that were absolutely baffling claude, and it appears that the project can resume development instead of needing to revert to an earlier commit or restart from scratch.

### Model Change Details:

Claude Sonnet 4 had huge problems at around task 2.1.1, 2.1.2, where it couldn't solve an authentication / validation glitch where the sign in fields kept showing 'field required' and disabling the 'sign in' button, even when filled properly.  It took Claude lots of effort and the use of a repomix file set to try to debug this and it still failed to solve it.

It kept saying confidently that it could definitely see the problem, and then it proceeded to apply extensive and various code changes that would have no effect on the problematic UI behaviour.  Claude sonnet 4 was not able to get the true sign in form to work, but it was able to make a 'test authentication' component that was able to sign in.  When asked to make the sign in form work using the same logic as the working test authentication form, it could not achieve this even though it said that they were matching exactly.

I was about to roll back the repo to a prior checkpoint or try deleting all the related files and building them again, but somehow just switching to GPT-5 mini was enough for it to read the repomix and look at the problem, and understand that there was an issue with v-model not connecting the fields to the validator logic properly and the authentication issue was solved.

GPT-5 mini was then far more helpful for being able to troubleshoot further errors with supabase authentication tokens, vite environment variables, and detecting whether github environment secrets were successfully being injected in github action workflows. GPT-5 mini was also able to make the true sign in form work with the same logic as the test authentication component and get the project back on track.

So at this point, the project is switching from having claude Sonnet 4 be the coding agent to having GPT-5 mini be the coding agent for a (currently) much more effective, informative, and time-saving experience.

Claude in agent mode would go ahead and make speculative changes in hopes of them working, and so there are a lot of strange files left over like old .ts files left in place just so that tests that used to expect them can still pass.  Soon, it will be important to look for and clean up such unneeded files and tests.  For now I would like to see how easily GPT-5 mini is able to handle taking over the implementation steps.



## Model change:  GPT 5 available, used for some tasks

### Model Change Details:

While finishing up phase 2.  GPT-5 mini has been doing well in general, however GPT-5 is available now as well, and I'm experimenting with using it for larger tasks or debugging and observing how it performs compared to GPT-5 mini.



## Workflow improvement:  One model in agent mode, one in ask mode

During implementation of phase 3, some SQL commands were generated to prepare the database for RLS policies.

I noticed how there was a lot of waiting time between prompts and waiting on the agent model to work, and I began to distribute the work between one chat window in agent mode, with another chat window open in ask mode.

The ask mode model was able to view the SQL made by the agent model and identify flaws with it.  And having two models to work with and talk with at the same time is reducing idle time waiting on responses.