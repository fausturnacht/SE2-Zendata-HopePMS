# SE2-Zendata-HopePMS - General Documentation
This branch will serve as the repository for all types of documentation. 
* The M5 (QA/Docs) will be the primary contributor and maintainer of this branch.
* Members M1 to M5 will document their prompts in their respective .md documents in /prompt-logs.

## How to Contribute
### Setting up your code editor to edit documentation
* Ensure your work has been saved and comitted.
* With this project folder (in your code editor) open, input the following commands into the terminal:

`git switch docs/all` | replaces your working directory (the files that is in your folder) with the contents of docs/all.

* Here, you can freely contribute to the documentation, like including another entry to your prompt log.
* Once you're finished: save, commit, and push. Your edits are then uploaded to the remote repository. 
* You can then switch back to your original working directory by entering: 

`git switch [branch-name]`

WARNING: If you have recently worked with the fullstack branches (e.g. dev or any feature branch) DO NOT COMMIT WHEN 1K+ FILES ARE BEING COMMITTED! This means that build artifacts or dependencies (like node_modules) are still present in your working directory. Refer to your AI assistant of choice to ensure these files are not committed.

### /prompt-logs (M1-M5)
* Follow the provided template. One entry has been provided for every member.
* There is no need to log every single prompt.
    * If you have an initial prompt and follow-up prompts that remedy the issues the initial prompt brought up, group them all into a single entry.
    * Prompt Given to AI: Initial prompt
    * What I changed/improved: Follow-up prompts

### /standups (M5 - QA/Docs)
* Summaries of meetings. Format each .md per meeting accordingly, but follow this rough guide:
    * Header: Sprint #, Week #
    * Date:
    * Time:
    * Duration:
    * Summary: 

### test-cases.md (M5 - QA/Docs)
* Save your docs file as .md and paste the contents inside.

### user-stories.md (M4 - RA)
* Save your docs file as .md and paste the contents inside.


