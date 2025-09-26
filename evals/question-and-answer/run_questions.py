#!/usr/bin/env python3
import subprocess
import sys
import re

def clean_ansi(text):
    return re.sub(r'\x1b\[[0-9;]*m', '', text)

def extract_final_message(text):
    lines = text.split('\n')
    final_message_lines = []
    capturing = False
    
    for line in lines:
        if line.startswith('> ') and '🛠️' not in line and 'Using tool:' not in line:
            capturing = True
            final_message_lines = [line[2:]]  # Remove "> " prefix
        elif capturing and (line.startswith('> ') or line.strip() == '' or not line.startswith(('🛠️', ' ⋮', ' ●'))):
            if line.startswith('> '):
                final_message_lines.append(line[2:])
            else:
                final_message_lines.append(line)
        elif capturing and (line.startswith('🛠️') or line.startswith(' ⋮') or line.startswith(' ●')):
            capturing = False
    
    return '\n'.join(final_message_lines).strip()

def run_questions():
    with open('EVALUATION_SET_1.md', 'r') as f:
        questions = [line.strip()[2:] for line in f if line.startswith('- ')]
    
    with open('EVALUATION_SET_1_OUTPUT.md', 'w') as output_file, \
         open('EVALUATION_SET_1_FULL_OUTPUT.md', 'w') as full_output_file:
        
        for i, question in enumerate(questions, 1):
            print(f"Processing question {i}...")
            
            prompt = f"Using the design system MCP, {question}"
            result = subprocess.run(['q', 'chat', '--no-interactive', '--trust-all-tools'], 
                                  input=prompt, text=True, capture_output=True)
            
            cleaned_output = clean_ansi(result.stdout)
            
            # Write to both files
            for file, content in [(output_file, extract_final_message(cleaned_output)), 
                                (full_output_file, cleaned_output)]:
                file.write(f"## Question {i}\n\n")
                file.write(f"**Question:** {question}\n\n")
                file.write(f"**Answer:** {content}\n\n")
            
            if result.stderr:
                print(f"Error on question {i}: {result.stderr}", file=sys.stderr)

if __name__ == "__main__":
    run_questions()
