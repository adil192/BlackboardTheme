# Changelog

Here I will outline the changes I've made over time...

### 20240201

- I'm working on converting this into an extension which solves some issues... But I need to wait for Mozilla to approve it before I can publish it.
    - Much easier to install
    - No need to manually check for updates
    - Styles kick in immediately, rather than after the page loads
- Removed curved corners from the navbar on Blackboard Ultra
- Makes the list view on Blackboard Ultra more compact
- Added a button to the course iframe to open the course content in a new tab
- Middle-click on a course card to open it in a new tab
- Fixed the minimum height of the page when viewing a course so the navbar reaches the bottom of the screen
- Fixed the video title not having the title font
- Fixed video keyboard shortcuts accidentally triggering the currently focused button
- Fixed the captions keyboard shortcut (`c`) sometimes not working

### 20240130

- Added stylings for the "Your download will start shortly. If it doesn't, download the file now." page

### 20240129

- Switched the default body font to [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible/about).
- Fixed a Blackboard Ultra bug on mobile where the breadcrumb bar would be floating near the top, rather than at the top.
- Styled (and fixed) the mobile header on Blackboard Ultra.
- Set the background color of the loading screen to be less jarring.
- Set the video title bar to have a dark background.
- Removed the margin around the video toolbar, and fixed the alignment of its icons.

### 20240128

- Styled and fixed the Blackboard Ultra header on mobile
- Added an "open with new tab" button to Blackboard videos. Requested by a friend so she could have a video and her notes in split screen.
- Fixed weirdness with the sizing of Blackboard videos (stops them sometimes scrolling off the screen)

### 20240127

- Initial stylings for the course page of the new Blackboard Ultra website, including:
  - Reduced the size of each course card (in the grid view) to fit more on the screen.
  - Decluttered the list view, removing mostly everything apart from the module title.
  - Decluttered the grid view, removing the internal module code and the course status (open vs closed).
  - Stopped cards moving up on hover.
- Performance optimisations for the add_course_images script.
- Versions prior to today break the new Blackboard Ultra website. It'll get stuck on the loading screen. Please update to the latest version of the script as soon as possible.

### 20240125

- Added a script to automatically click the login button on the Blackboard login page if your details are saved in your browser (see the [README][README] for instructions)

### 20240123

- Restyled the asides in course pages (in my course, they're labelled "Learning Outcomes" on each week's section)

### 20240122

- Differentiated 1st and 2nd semester courses more. Specifically, 1st semester courses have a desaturated color, and their images are slightly blurred.
- Fixed the highlight_current_modules.js script not doing anything sometimes (the window load event was not being fired).
- Fixed a subtle animation bug when hovering on 1st semester courses.
- Fixed the appearance (height) of the `:focus` ring on module cards.
- Subtitles in videos are now left-aligned instead of centered.

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
