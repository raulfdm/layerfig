---
"@layerfig/config": patch
---

Fix: escape line breaks and special characters in slot values

- Safely escape \, ", \n, \r, and \t before insertion to avoid misparse/misrender issues.