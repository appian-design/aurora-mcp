# Design System MCP Evaluation

This repository contains tools for evaluating design system MCP answers against expected results using LLM-as-judge methodology.

## Files

- `EVALUATION_SET_1.md` - Questions to test
- `EVALUATION_SET_1_OUTPUT.md` - MCP-generated answers
- `EVALUATION_SET_1_ANSWER_KEY.md` - Expected answers
- `simple_evaluate.py` - Evaluation script

## Quick Start

**Fully automated evaluation:**
```bash
# Default (uses EVALUATION_SET_1_OUTPUT.md)
python3 simple_evaluate.py

# Or with custom answer file
python3 simple_evaluate.py NEW_ANSWERS.md
```

This automatically:
- Creates evaluation prompt
- Runs Q CLI evaluation 
- Saves results with pass/fail analysis to `evaluation_results_with_pass_fail_[filename].txt`

## Evaluation Process

### Step 1: Prepare Files
Ensure you have three files:
- Questions (markdown list format: `- Question text`)
- MCP answers (sections starting with `## Question N` and containing `**Answer:**`)
- Expected answers (sections with `Expected Answer:` format)

**MCP Answers Format Requirements:**
```markdown
## Question 1

**Question:** What should I use as a separator in breadcrumbs?

**Answer:** Your answer text here...

## Question 2

**Question:** Next question text...

**Answer:** Next answer text...
```

Create the MCP Answers file by running:
```bash
python3 run_questions.py
```

This script automatically:
- Reads all questions from `EVALUATION_SET_1.md`
- Asks each question using the design system MCP via Q CLI (with `--trust-all-tools` flag)
- Saves formatted answers to `EVALUATION_SET_1_OUTPUT.md`
- Saves complete Q CLI output to `EVALUATION_SET_1_FULL_OUTPUT.md` for debugging

### Step 2: Run Automated Evaluation
```bash
python3 simple_evaluate.py [ANSWER_FILE.md]
```

This creates:
- `evaluation_prompt_[filename].txt` - LLM prompt
- `answer_comparison_[filename].json` - Structured comparison data
- `evaluation_results_with_pass_fail_[filename].txt` - **Complete results with scores and pass/fail analysis**

### Generated Results File Contains:
- Summary statistics (average score, pass rate) shown first
- Score breakdown by performance level  
- List of critical failures
- Individual question scores with explanations
- Pass/fail status for each question (≥6 = Pass)

## Scoring Scale

- **10:** Perfect match in meaning and content
- **8-9:** Very good match, captures main points with minor differences
- **6-7:** Good match, captures key concepts but missing some details
- **4-5:** Partial match, some correct information but significant gaps
- **2-3:** Poor match, minimal correct information
- **0-1:** No match or completely incorrect

## Pass/Fail Criteria

- **Pass:** Score ≥ 6/10
- **Fail:** Score < 6/10

## Example Output

```
Average Score: 8.33/10 (100.0% pass rate)
Pass Rate: 100.0% (15 out of 15 questions passed)
Failed Questions: 0
```

## Manual Evaluation (if needed)

If automatic evaluation fails, you can run manually:
```bash
cat evaluation_prompt_[filename].txt | q chat --no-interactive > results.txt
```

## Troubleshooting

- Ensure all three input files have matching question counts
- Check markdown formatting matches expected patterns
- Verify Q CLI is installed and accessible
- Script automatically cleans ANSI escape codes from Q CLI output

## Customization

To modify evaluation criteria:
1. Edit the scoring scale in `simple_evaluate.py`
2. Adjust pass/fail threshold (currently 6/10)
3. Modify prompt template for different evaluation focus
