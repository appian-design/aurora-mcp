# Set 1: Testing Components

1. ##  **Breadcrumbs**

ID: breadcrumbs-lookup-001

Question: What should I use as a separator in breadcrumbs?

Expected Answer: Use a forward slash as the separator.

2. ## **Breadcrumbs**

ID: breadcrumbs-lookup-002

Question: Should I add a link on separators?

Expected Answer: No

3. ## **Buttons**

ID: buttons-lookup-001

Question: What case should text in buttons be?

Expected Answer: Sentence case. They will display as uppercase based on branding configurations.

4. ## **Buttons**

ID: buttons-howto-001

Question: What side of the screen should the primary button in a form be on? What about for the secondary button? Can I have more than one secondary button?

Expected Answer: The primary button should be on the right, the main secondary button on the farthest left. You can have more than one secondary button.

5. ## **Buttons**

ID: buttons-ambiguous-001

Question: What shape should my button be?

Expected Answer: It depends on where you are using the button. Platform buttons should use 'SQUARED' and Solutions/PHQ buttons should use 'SEMI\_ROUNDED'.

6. ## **Buttons**

ID: buttons-lookup-002

Question: How should I style a destructive action?

Expected Answer: Use GHOST style and NEGATIVE color.

7. ## **Buttons**

ID: buttons-lookup-003

Question: What component should I use for icon-only actions?

Expected Answer: Use a\!richTextIcon

8. ## **Cards**

ID: cards-howto-001

Question: Should I add a border or shadow to my card if the background color is \#FFFFFF (White)?

Expected Answer: Add a border with the color \#EDEEFA.

9. ## **Cards**

ID: cards-howto-003

Question: How should I handle an empty state in a card when I have no data/information available?

Expected Answer: Use an empty state message that includes a prominent icon, followed by a heading, a description, and an action to add data.

10. ## **Cards**

ID: cards-ambiguous-001

Question: What shape should my cards be?

Expected Answer: It depends on the use case. If the card is used as a container for information, it should be semi-rounded. If it's used flush against a header or as a sidebar, it should be squared.

11. ## **Confirmation Dialog**

ID: confirmation-dialog-comparative-001

Question: When should I use an informational dialog vs. an action confirmation dialog?

Expected Answer: Informational dialogs are used to display view-only information. Action confirmations are used to get confirmation on an irreversible action.

12. ## **Milestones**

ID: milestones-comparative-001

Question: When should I use vertical milestones vs. horizontal milestones?

Expected Answer: Use a vertical orientation for 6 or more steps and a horizontal orientation for less than 6 steps. Use your judgment for 3-6 steps.

13. ## **Milestones**

ID: milestones-lookup-001

Question: What style should I use for milestones?

Expected Answer: Depends on the how many steps. Use MINIMAL in wizards if you want to reduce prominence, otherwise use DOT.

14. ## **More less**

ID: moreless-lookup-001

Question: How many characters should I display before I show a more/less link?

Expected Answer: 255 characters

15. ## **Tabs**

ID: tabs-ambigious-001

Question: Are tabs accessible?

Expected Answer: OOTB tabs are, if you are custom making tabs be sure to specify 'Selected' in the accessibilityText parameter to ensure screen readers identify the selected tab.

16. ## **Tags**

ID: tags-lookup-001

Question: What colors should I use for my tags?

Expected Answer: The background color should be \<color\> 1 and the content color should be the corresponding \<color\> 4\.

# Set 2: Testing Patterns

17. ## **Banners**

ID: banners-lookup-1

Question: Should I include a decorative bar on a flush banner?

Expected Answer: No

18. ## **Banners**

ID: banners-ambiguous-1

Question: What shape should my banner be?

Expected Answer: It depends on where you are using the banner. Platform banners should use 'SQUARED' and Solutions/PHQ banners should use 'SEMI\_ROUNDED'.

19. ## **Cards as Choices**

ID: cards-as-choices-lookup-1

Question: What pattern should I use to have cards as choices when I need a lot of text to describe the choice?

Expected Answer: Side by Side content variant

20. ## **Charts**

ID: charts-lookup-1

Question: When should I use a tooltip on my chart title?

Expected Answer: When the chart title includes terms that might not be universally understood

21. ## **Comment Thread**

ID: comment-thread-lookup-1

Question: Should I display users with their initials or their profile image?

Expected Answer: If a user has a profile image, we should display their image. Only when a user doesn’t have a profile image should we show initials.

22. ## **Inline Dialog**

ID: inline-dialog-lookup-1

Question: What color should I use for the background of an inline dialog?

Expected Answer: \#FAFAFA

23. ## **Inline Dialog**

ID: inline-dialog-lookup-2

Question: If I have 10 fields, should I use an inline dialog?

Expected Answer: No

24. ## **KPI**

ID: kpi-lookup-1

Question: Is there a max number of KPIs I should display at once?

Expected Answer: Avoid using more than 5 KPIs

25. ## **Notifications**

ID: notifications-lookup-1

Question: How should I indicate the number of notifications a user has?

Expected Answer: Use a tag with the number of notifications, use 10+ if there are more than 10 notifications.

26. ## **Pick List**

ID: picklist-lookup-1

Question: I have a form where users need to see additional information about their selected items. How best can I do this pattern?

Expected Answer: Use a picklist pattern

# Set 3: Testing Layouts

27. ## **Forms**

ID: forms-lookup-1

Question: What title should I use when a user is modifying a form they’ve already completed?

Expected Answer: Update

28. ## **Forms**

ID: forms-lookup-2

Question: Do I need a review step in my form?

Expected Answer: Yes if you have more than 3 steps, it’s recommended to include a review step.

29. ## **Forms**

ID: forms-howto-1

Question: I have a lot of fields to display in my form. They’re not all directly related to each other. Should I put them side by side to save space or in a single column?

Expected Answer: Single column

30. ## **Grids**

ID: grids-lookup-1

Question: I have a sortable grid. What border style should I use?

Expected Answer: Standard

31. ## **Grids**

ID: grids-lookup-2

Question: What batch size should I use for a full page grid?

Expected Answer: 25

32. ## **Grids**

ID: grids-lookup-3

Question: How should text be aligned in grids? What about numbers?

Expected Answer: Text should be left aligned. Numbers should be right aligned

33. ## **Pane Layouts**

ID: pane-lookup-1

Question: Why should I use a pane layout?

Expected Answer: Use a pane layout to display independently scrolling sections on an interface

34. ## **Record Views**

ID: record-views-lookup-1

Question: Is there a max number of views a record should have?

Expected Answer: Use at most 6 views in a record

35. ## **Record Views**

ID: record-views-ambiguous-1

Question: Where should I put actions in a record view

Expected Answer: Local actions should be next to where the data resides in a view. Global actions should be next to the record header.

# Set 4: Branding

36. ## **Approach to AI**

ID: approach-to-ai-lookup-1

Question: What color should I use for AI iconography?

Expected Answer: \#08088D

37. ## **Approach to AI**

ID: approach-to-ai-lookup-2

Question: If something on the screen uses AI, do I have to visually indicate that they’re using AI?

Expected Answer: Yes

38. ## **Colors**

ID: colors-lookup-1

Question: What’s the Sky 3 color?

Expected Answer: \#3F8EEE

39. ## **Colors**

ID: colors-lookup-2

Question: What shades of pink do we have in our palette?

Expected Answer: Pink 0: \#FFDEF3, Pink 1: \#FFDEF3, Pink 2: \#F7A7DA, Pink 3: \#E21496, Pink 35: \#BB117C, Pink 4: \#8C1565

40. ## **Colors**

ID: colors-lookup-3

Question: What color should I use for a negative background?

Expected Answer: Red 0, \#FDEDF0

41. ## **Icons**

ID: icons-lookup-1

Question: What icon should I use for remove?

Expected Answer: times

42. ## **Typography**

ID: typography-lookup-1

Question: What size text should I use for page titles?

Expected Answer: Large

43. ## **Typography**

ID: typography-lookup-2

Question: What colors should my section labels be?

Expected Answer: Standard  
