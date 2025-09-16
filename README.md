# Story Starter

A project for practicing a code gen workflow. Users can give character or story elements to an LLM and get story ideas they can use as a starting point to help them think of ideas.

It will be hosted on [GitHub Pages](https://ljacobdev.github.io/story-starter)


Several 'prompt plan' files were generated because 4o was initially being too brief, and a few attempts were made at improving it until I had claude sonnet 4 make the prompt plan instead.  This was because I saw in previous practice that claude sonnet generated much more thorough and detailed prompt plans, and it seemed like a good idea to have claude do it because it was also going to be the agent that would receive the prompts and implement the plan, and this allowed it to optimize the prompts for it own success.

I might do multiple version of this app, using one or another prompt plan, to see if one method is faster and still succeeds, or whether the more thorough one turns out better even if it takes longer.


The purpose of doing this project is to get practice with agentic coding, to stress test what it's able to do, and to get familiar with its strength and limitations.  

The code and tests are not being deeply scrutinized in this project, and the main concern is with getting the high level functionality and appearance to work.

Some of the commits will have unusually long commit messages, but to help with better tracking the thoughts at each step.

Next I will want to iterate on this kind of project again to start focusing on code organization and quality.


### Current state

This workflow is attempting to rely on prompts to get the work done, with infrequent human intervention, to see whether a careful workflow and prompt plan is able to achieve results where the agent does most of the activity.

The agent has been stuck for a long time on getting a sign in form to work.  It has tried numerous fixes, and had repomix files prepared for it to help it understand context.  It has often said with utter confidence that it could see the problem, and was going to fix it, but then would make changes that had no impact on the problem.

Strangely, it was able to produce a successful authentication component that it used to test authentication, but it wasn't able to carry the understanding of what made that test component work into the actual sign up form.


### Strengths of the LLM agent in this project

Helping to create specs and implementation plans, and keeping track of goals and things learned


### Limitations of the LLM agent in this project

It jumps on problems confidently, makes long explanations about why it thinks it will easily solve them, and takes a long time to work on them but fails to solve the tasks and often makes things worse while trying


### Next steps

Hope to either find a way to help frame the problem into something that the LLM can more easily work with, or else start adapting the workflow where development relies more heavily on the human developer taking care of things directly