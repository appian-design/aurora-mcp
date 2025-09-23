# Evaluation Plan: Generating SAIL interfaces for apps

## Overview

Test MCP server performance by requesting generation of a pre-determined set up interfaces with use case context

## Methodology

1. Generate 5 different interface types using current MCP server:
   - Multi-step form
   - Dashboard with KPIs
   - Landing page with data grid
   - Document management interface
   - Comment/discussion interface

2. Document current outputs focusing on:
   - Visual sophistication level
   - Use of professional styling patterns
   - Component composition complexity
   - Comparison to reference examples

## Prompt Template

- Run the following prompt for each test case
- Run them in the same session if possible

```
## Goal

Generate a high-quality, professional-level interface using Appian SAIL for the given test case

## Business Context

**Company:** Pacific Coast Credit Union
**Background:** Regional credit union serving 85,000 members across California, modernizing member onboarding from paper-based processes to digital-first experience. Target: reduce processing time from 7 days to 24 hours while maintaining compliance.

**Key Personas:**
- **Carlos Martinez (New Member):** Small business owner needing quick account opening, limited time during business hours
- **Maria Chen (Member Services Rep):** Processes 15-20 applications daily, needs visibility into completion status and compliance requirements
- **Robert Kim (Compliance Officer):** BSA/AML specialist ensuring regulatory compliance, needs audit trails and risk screening

## Specific Test Case
[Single test case details]

## Design System MCP Usage and Outputs

- Use the design system MCP to generate an interface for each test case
- IMPORTANT: Start by exploring available categories (layouts, patterns, components) to understand what's available
- Work from high-level to specific: first identify relevant layouts, then supporting patterns, finally individual components
- After selecting design system elements, review the sail-coding-guidance and accessibility checklist to avoid basic errors
- IMPORTANT: Only use SAIL functions and syntax that are represented in the design system; don't make assumptions
- Generate each interface in a separate .txt file
- Don't include comments in the output file unless absolutely necessary
```

## Test Cases

**1. KPI Dashboard**
- **User Story:** As a member services manager, I want to see real-time application processing metrics, so that I can identify bottlenecks and allocate staff effectively.
- **Sample Data:** Daily application volumes (150-200/month), processing times by stage, completion rates, staff performance metrics, compliance screening results

**2. Multi-step Application Wizard**
- **User Story:** As a new member, I want to complete my account application in guided steps with progress tracking, so that I can apply outside business hours and save my progress.
- **Sample Data:** Account types (Essential Checking, Business Advantage, Youth Savings), required documents by product type, identity verification steps, fee structures

**3. Work Queue Landing Page**
- **User Story:** As a member services rep, I want to see my daily work queue with application priorities and completion status, so that I can process ready applications efficiently.
- **Sample Data:** Application queue (20-30 pending), completion percentages, priority indicators (new business, existing member), action items, SLA targets

**4. Document Management Interface**
- **User Story:** As a member services rep, I want to review all uploaded documents for an application in one interface, so that I can verify completeness and process approvals quickly.
- **Sample Data:** Document types (ID, proof of address, business license, bank statements), upload status, OCR extraction results, compliance flags

**5. Communication/Notes Interface**
- **User Story:** As a member services rep, I want to track all communication with a member about their application, so that any team member can provide consistent service.
- **Sample Data:** Timeline of interactions, phone notes, email correspondence, document requests, member responses, internal comments

## Evaluation Criteria 

1. **Visual Sophistication**: Professional color schemes, spacing, visual hierarchy
2. **Component Composition**: Complex multi-component patterns vs simple components
3. **Layout Architecture**: Use of advanced layout patterns (responsive columns, etc.)
4. **Professional Styling**: Proper margins, padding, decorative elements
5. **Functional Completeness**: Complete workflows vs partial implementations
6. **Guideline Adherence**: Accurate application of usage guidance