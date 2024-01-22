# Changelog

Here I will outline the changes I've made over time...

### 20240122

- Differentiated 1st and 2nd semester courses more. Specifically, 1st semester courses have a desaturated color, and their images are slightly blurred.
- Fixed the highlight_current_modules.js script not doing anything sometimes (the window load event was not being fired).

### 20240119

- The Pixabay API is now used to get images for unknown modules.
- Fixed non-current modules being incorrectly clipped.

### 20240107

- Fixed issues with tables that have a `<thead>` element
    - The first non-header row was being styled as a header
    - The header was incorrectly given rounded corners
- Ensured that the course pages' sidebar takes up the full height of the viewport
- Added a subtle border between a module image and its title
- Set the color of selected text on the quiz page

### 20240105

- Made module images clickable again

### 20240104

- Styled tables in course pages

### 20240103

- Headings will use the "Urbanist" font, and the body text will use the "Inter" font
- Improved the look of the module cards
- Added an Atkinson Hyperlegible addon (see the [README][README] for instructions)
- Fixed the look of the mobile menu dropdown button (#menuPuller)

### 20240102

- Updated the colors to better match a Material You palette
- Added a subtle transition to the module selection grid

### 20231211

- Fixed the add_course_images script sometimes not working
- Added images for individual modules (with the add_course_images script)

### 20231204

- Added popup icons when you play/pause a video (just like on YouTube)

### 20231116

- Fixed icons not displaying in Blackboard videos (such as the fullscreen icon)
- Videos are no longer anti-aliased so they look sharper. On lower resolution displays, this could cause the video to look pixelated.

### 20231113

- Updated the styling for the assessment page

### 20231106

- Fixed video popup menus always being hoverable
- Hidden the "Download Subtitles and Transcription" button from videos
- Used less-rounded corners on the Blackboard course tabs
- Fixed inconsistent spacing on the Blackboard homepage
- Added a third script to add images to the module list on the Blackboard homepage (see the [README][README] for instructions). Currently, only COMP and MATH modules are supported, but please let me know your module codes and I'll add them.
- Added more custom icons to Blackboard course pages

### 20231105

- Replaced images from my personal website with their original sources

### 20231104

- Added a second script to add keyboard shortcuts to the Blackboard video player (see the [README][README] for instructions)
    - Left and right arrow keys to skip 10 seconds
    - Up and down arrow keys to increase/decrease volume
    - Spacebar to play/pause
    - F key to toggle fullscreen
    - C key to toggle captions

### 20231103

- Fixed the optional script sometimes not working
- Adapted the optional script to also highlight 2nd semester courses in the former-courses tab
- Uploaded the script to https://greasyfork.org/en/scripts/478967-uom-blackboard-userscript
    - Users are recommended to install from there (it will automatically replace the old version of the script)
    - This script will now auto update (hopefully)
- Replaced the generic image on the Blackboard homepage with an image of The Queen's Arch here in Manchester

### 20231029

- Fixed videos getting cropped weirdly

[README]: https://github.com/adil192/BlackboardTheme
