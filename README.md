# Story Starter

A project for practicing a code gen workflow. Users can give character or story elements to an LLM and get story ideas they can use as a starting point to help them think of ideas.

It will be hosted on [GitHub Pages](https://ljacobdev.github.io/story-starter)


Several 'prompt plan' files were generated because 4o was initially being too brief, and a few attempts were made at improving it until I had claude sonnet 4 make the prompt plan instead.  This was because I saw in previous practice that claude sonnet generated much more thorough and detailed prompt plans, and it seemed like a good idea to have claude do it because it was also going to be the agent that would receive the prompts and implement the plan, and this allowed it to optimize the prompts for it own success.

I might do multiple version of this app, using one or another prompt plan, to see if one method is faster and still succeeds, or whether the more thorough one turns out better even if it takes longer.


The purpose of doing this project is to get practice with agentic coding, to stress test what it's able to do, and to get familiar with its strength and limitations.  

The code and tests are not being deeply scrutinized in this project, and the main concern is with getting the high level functionality and appearance to work.

Some of the commits will have unusually long commit messages, but to help with better tracking the thoughts at each step.

Next I will want to iterate on this kind of project again to start focusing on code organization and quality.