
# TypeWriter Textbox

This is a very important feature, we want it to have:

- A queue system so we can dynamically add text to the queue
- Style flags that can be specified within text like ["x: y"] text blah blah [/]
  - There can be multiple, "color: ", "style: yelling", "effect: jumping", "font-style: bold"
- When you call queue, it can take an optional "speaker" parameter
  - A speaker has a prefix ("Player: "), an orientation, and styling
  