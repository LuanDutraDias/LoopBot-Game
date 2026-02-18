I AM SO GLAD WITH THE RESULT. I put a lot of effort, time, and love into this project.

# LoopBot
- LoopBot is a browser-based programming puzzle game inspired by LightBot.
- The player controls a robot on a 5x5 grid by assembling a sequence of commands that are executed step by step.
- The objective is to light all required tiles while respecting terrain height rules and avoiding falling into empty tiles.
- This version represents the continuation of the project, which I decided to further develop independently after submitting the previous version for the Web Development course.

## Features & What I Learned and Improved
- The game instructions are simple because the idea is that the user learns how to play by himself, like Mario games do
- 6 progressive levels
- Main program with nested procedures (P1 and P2)
- Height-based movement system
- Jump mechanics with animation
- Sound effects and background music (Howler.js)
- Level unlocking system
- Bilingual interface (English / Portuguese)
- Responsive layout using CSS Grid and Flexbox
- Animated transitions and visual feedback
- Dynamic level selection screen
- Instruction screen built dynamically via JavaScript
- DOM Manipulation
- Player object for position, direction, height, and state
- Arrays for command queues (MAIN, P1, P2)
- Commands are executed sequentially using setTimeout, creating step-by-step animation timing and delayed sound effects.
- clamp() for fluid sizing
- aspect-ratio for square board
- Viewport-based scaling
- Handling audio with an external library
- UI control
- Structured and well-organized functions
- Hover effects
- Dynamic color changes

## Boundary Checking
- Movement validation ensures the robot:
- Does not move outside the grid
- Does not move to invalid height differences
- Does not step on empty tiles
  
## Technologies Used
- HTML5
- CSS3 (Grid, Flexbox, clamp, aspect-ratio, transitions)
- Vanilla JavaScript (ES6+)
- Howler.js (for audio handling)
- Bootstrap Icons
- Technical Concepts Applied
