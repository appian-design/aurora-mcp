#!/usr/bin/env python3
import re
import json
import sys

def parse_files(mcp_answers_file='EVALUATION_SET_1_OUTPUT.md'):
    """Parse all three files and return structured data"""
    # Parse questions
    with open('EVALUATION_SET_1.md', 'r') as f:
        content = f.read()
    questions = [line[2:].strip() for line in content.strip().split('\n') if line.startswith('- ')]
    
    # Parse MCP answers
    with open(mcp_answers_file, 'r') as f:
        content = f.read()
    
    mcp_answers = []
    sections = re.split(r'## Question \d+', content)[1:]
    
    for section in sections:
        lines = section.strip().split('\n')
        answer_text = []
        capturing = False
        
        for line in lines:
            if line.startswith('**Answer:**'):
                capturing = True
                answer_text.append(line.replace('**Answer:**', '').strip())
            elif line.startswith('**Source:**'):
                break
            elif capturing and line.strip():
                answer_text.append(line.strip())
        
        mcp_answers.append(' '.join(answer_text))
    
    # Parse expected answers
    with open('EVALUATION_SET_1_ANSWER_KEY.md', 'r') as f:
        content = f.read()
    
    expected_answers = []
    sections = re.split(r'Expected Answer:', content)
    
    for section in sections[1:]:
        lines = section.strip().split('\n')
        answer = lines[0].strip()
        expected_answers.append(answer)
    
    return questions, mcp_answers, expected_answers

def create_evaluation_prompt(questions, mcp_answers, expected_answers):
    """Create a single prompt for batch evaluation"""
    prompt = """You are evaluating how well AI assistant answers match expected answers for design system questions. 

For each question below, rate the match between the AI answer and expected answer on a scale of 0-10:
- 10: Perfect match in meaning and content
- 8-9: Very good match, captures main points with minor differences  
- 6-7: Good match, captures key concepts but missing some details
- 4-5: Partial match, some correct information but significant gaps
- 2-3: Poor match, minimal correct information
- 0-1: No match or completely incorrect

Format your response as:
Q1: [score] - [brief reason]
Q2: [score] - [brief reason]
...

Here are the questions to evaluate:

"""
    
    for i, (question, mcp_answer, expected_answer) in enumerate(zip(questions, mcp_answers, expected_answers), 1):
        prompt += f"""
Q{i}: {question}
AI Answer: {mcp_answer}
Expected: {expected_answer}

"""
    
    return prompt

def run_evaluation_and_save_results(prompt_file, base_name):
    """Run Q CLI evaluation and save results with pass/fail analysis"""
    import subprocess
    import re
    
    try:
        # Run Q CLI evaluation
        result = subprocess.run([
            'bash', '-c', f'cat {prompt_file} | q chat --no-interactive'
        ], capture_output=True, text=True, timeout=120)
        
        if result.returncode != 0:
            print(f"Error running evaluation: {result.stderr}")
            return False
        
        # Clean ANSI escape codes from output
        output = result.stdout
        ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
        clean_output = ansi_escape.sub('', output)
        
        # Parse the output to extract scores
        lines = clean_output.strip().split('\n')
        
        # Find lines that contain scores (Q1:, Q2:, etc.)
        score_lines = []
        for line in lines:
            if re.match(r'^Q\d+:', line.strip()):
                score_lines.append(line.strip())
        
        if not score_lines:
            print("No scores found in evaluation output")
            return False
        
        # Process scores and add pass/fail
        processed_lines = []
        total_score = 0
        pass_count = 0
        
        for line in score_lines:
            # Extract score from line (format: "Q1: 8 - explanation")
            score_match = re.search(r'Q\d+:\s*(\d+)', line)
            if score_match:
                score = int(score_match.group(1))
                total_score += score
                pass_fail = "[PASS]" if score >= 6 else "[FAIL]"
                if score >= 6:
                    pass_count += 1
                processed_lines.append(f"{line} {pass_fail}")
            else:
                processed_lines.append(line)
        
        # Create summary
        num_questions = len(score_lines)
        avg_score = total_score / num_questions if num_questions > 0 else 0
        pass_rate = (pass_count / num_questions * 100) if num_questions > 0 else 0
        
        # Create results content
        results_content = f"""LLM Evaluation Results - Design System MCP Answers (with Pass/Fail)

Pass Threshold: 6/10 (answers scoring 6+ are considered passing)

{chr(10).join(processed_lines)}

SUMMARY:
- Total Questions: {num_questions}
- Average Score: {avg_score:.2f}/10 ({total_score}/{num_questions*10} total points)
- Pass Rate: {pass_rate:.1f}% ({pass_count} out of {num_questions} questions passed)
- Failed Questions: {num_questions - pass_count}

Score Breakdown:
- Perfect Scores (10): {len([l for l in processed_lines if ' 10 ' in l])} questions [PASS]
- High Scores (8-9): {len([l for l in processed_lines if ' 8 ' in l or ' 9 ' in l])} questions [PASS]
- Medium Scores (6-7): {len([l for l in processed_lines if ' 6 ' in l or ' 7 ' in l])} questions [PASS]
- Low Scores (0-5): {len([l for l in processed_lines if any(f' {i} ' in l for i in range(0, 6))])} questions [FAIL]

Critical Failures:
{chr(10).join([f"- {line.split(':')[0]}: {line.split(' - ')[1].split(' [')[0] if ' - ' in line else 'No explanation'}" for line in processed_lines if '[FAIL]' in line])}"""
        
        # Save results
        results_file = f'evaluation_results_with_pass_fail_{base_name}.txt'
        with open(results_file, 'w') as f:
            f.write(results_content)
        
        print(f"\nEvaluation completed!")
        print(f"Results saved to: {results_file}")
        print(f"Average Score: {avg_score:.2f}/10 ({pass_rate:.1f}% pass rate)")
        
        return True
        
    except Exception as e:
        print(f"Error running evaluation: {str(e)}")
        return False

def main():
    # Check if custom MCP answers file provided
    mcp_answers_file = sys.argv[1] if len(sys.argv) > 1 else 'EVALUATION_ANSWERS_SET_1.md'
    
    print(f"Using MCP answers file: {mcp_answers_file}")
    
    try:
        questions, mcp_answers, expected_answers = parse_files(mcp_answers_file)
    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
        print("Usage: python3 simple_evaluate.py [mcp_answers_file.md]")
        return
    
    print(f"Parsed {len(questions)} questions, {len(mcp_answers)} MCP answers, {len(expected_answers)} expected answers")
    
    # Ensure all lists are the same length
    min_len = min(len(questions), len(mcp_answers), len(expected_answers))
    questions = questions[:min_len]
    mcp_answers = mcp_answers[:min_len]
    expected_answers = expected_answers[:min_len]
    
    # Create evaluation prompt
    prompt = create_evaluation_prompt(questions, mcp_answers, expected_answers)
    
    # Create output filename based on input
    base_name = mcp_answers_file.replace('.md', '').replace('EVALUATION_ANSWERS_', '').lower()
    prompt_file = f'evaluation_prompt_{base_name}.txt'
    comparison_file = f'answer_comparison_{base_name}.json'
    
    # Save prompt to file
    with open(prompt_file, 'w') as f:
        f.write(prompt)
    
    print(f"\nEvaluation prompt saved to: {prompt_file}")
    
    # Create comparison file for easy review
    comparison_data = []
    for i, (question, mcp_answer, expected_answer) in enumerate(zip(questions, mcp_answers, expected_answers), 1):
        comparison_data.append({
            'question_num': i,
            'question': question,
            'mcp_answer': mcp_answer,
            'expected_answer': expected_answer
        })
    
    with open(comparison_file, 'w') as f:
        json.dump(comparison_data, f, indent=2)
    
    print(f"Answer comparison saved to: {comparison_file}")
    
    # Run evaluation and save results
    print(f"\nRunning evaluation...")
    success = run_evaluation_and_save_results(prompt_file, base_name)
    
    if not success:
        print(f"Automatic evaluation failed. You can run manually with:")
        print(f"cat {prompt_file} | q chat --no-interactive > evaluation_results_{base_name}.txt")

if __name__ == "__main__":
    main()
