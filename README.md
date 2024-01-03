# UoM Blackboard theme

This project applies [Google's Material Design](https://m3.material.io/) to
the University of Manchester's websites.

This is more than just a theme; it also vastly improves the usability
and readability of the websites.

I was originally only restyling Blackboard, but I've since expanded it to
other UoM websites.

[![CodeFactor](https://www.codefactor.io/repository/github/adil192/blackboardtheme/badge)](https://www.codefactor.io/repository/github/adil192/blackboardtheme)

## Install

### Install styling

- Install Stylus [for Firefox](https://addons.mozilla.org/en-GB/firefox/addon/styl-us/) or [for Chrome](https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne) depending on your browser.
- Go to https://userstyles.world/style/4931/uom-blackboard-theme and click on the Install button.

### Install optional scripts

- Install Tampermonkey [for Firefox](https://addons.mozilla.org/en-GB/firefox/addon/tampermonkey/) or [for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- Go to each of these links and click on the Install button:
    - [Highlight current modules](https://greasyfork.org/en/scripts/478967-uom-blackboard-highlight-current-modules)
    - [Video keyboard shortcuts](https://greasyfork.org/en/scripts/479044-uom-blackboard-video-keyboard-shortcuts)
    - [Module list images](https://greasyfork.org/en/scripts/479199-uom-blackboard-add-course-images)

### Atkinson Hyperlegible

- If you have low vision or would otherwise benefit from the [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible/about) font,
you can install the [Hyperlegible addon](https://userstyles.world/style/14032/uom-blackboard-theme-hyperlegible-addon) as well.

## Why use this theme?

- Rethemes the Blackboard website
    - Better icons and logos
    - Locate your modules easily with the new **grid view**
    - When you're in the second semester, first semester modules will be dulled so you can focus on your new modules. *(requires script)*
    - Assessment/quiz pages have **more separation between questions to avoid overwhelming you**
- Rethemes the login and duo pages
    - Removes the useless FAQs no-one reads and adds a nice picture of Uni Place
- Rethemes the My Manchester portal including the attendance page
    - (My Manchester is currently offline anyway)
- Rethemes Blackboard videos
   - Captions are more readable with better fonts and a smaller width
   - More readable progress bar
   - **Standard keyboard shortcuts are added** *(requires script)*
      - Left and right arrow keys to skip 10 seconds
      - Up and down arrow keys to increase/decrease volume
      - Spacebar to play/pause
      - F key to toggle fullscreen
      - C key to toggle captions
- Styling and colouring inspired by [Google's Material Design](https://m3.material.io/)
- Uses better, **more readable fonts** everywhere

Features marked with *requires script* require you to install the optional scripts (see the [Install](https://github.com/adil192/BlackboardTheme#install) instructions above).

## Screenshots

These screenshots are taken at 1.33x zoom:

| Page | Before | After |
| --- | --- | --- |
| Blackboard | ![Before](screenshots/blackboard_before.png) | ![After](screenshots/blackboard_after.png) |
| Module images | ![Before](screenshots/blackboard_after.png) | ![After](screenshots/blackboard_images.webp) |
| Course page | ![Before](screenshots/course_before.png) | ![After](screenshots/course_after.png) |
| Assessments | ![Before](screenshots/quiz_before.png) | ![After](screenshots/quiz_after.png) |
| Attendance | (Offline) | ![After](screenshots/attendance_after.png) |
| Login | ![Before](screenshots/login_before.png) | ![After](screenshots/login_after.png) |
| Duo 2FA | ![Before](screenshots/duo_before.png) | ![After](screenshots/duo_after.png) |
| Video player | ![Before](screenshots/video_before.jpg) | ![After](screenshots/video_after.jpg) |
| IT Account Manager | ![Before](screenshots/iam_before.png) | ![After](screenshots/iam_after.png) |

## Development notes

#### Folder structure

```
BlackboardTheme
├── assets (images and other assets used in the css)
│   └── subjects (for the "Module list images" script)
├── screenshots (used in this README)
├── scripts (for the optional scripts)
│   ├── add_course_images.js
│   ├── highlight_current_modules.js
│   └── video_keyboard_shortcuts.js
├── styles (each domain has its own scss file, except for...)
│   ├── _globals.scss (defines colours, fonts, etc.)
│   ├── _version.scss (the userstyle metadata, including the version number)
├── CHANGELOG.md
├── main.css (the compiled main.scss)
├── main.scss (imports all the other scss files)
├── package.json (defines dependencies for the lint workflow in `.github/workflows/lint.yml`)
└── README.md
```

#### Adding a new subject to the [Module list images](https://greasyfork.org/en/scripts/479199-uom-blackboard-add-course-images) script

Unsupported subjects will have this default image:

<img src="assets/queens_arch.jpg" alt="Queen's arch" width=100>

If you want to add your subject(s) to the
[Module list images](https://greasyfork.org/en/scripts/479199-uom-blackboard-add-course-images) script, you can either
[submit an issue](https://github.com/adil192/BlackboardTheme/issues/new) and I'll add it for you;
or you can do it yourself and submit a pull request:

1. Identify the subject/module code. An example module code is `ABCD10000`, where `ABCD` is the subject code. You can choose to add a subject code or a module code.
2. Add an image to the `assets/subjects/ABCD/` folder where `ABCD` is the subject/module code (you'll need to make this folder). The image must be named `ABCD.jpg` or `ABCD.png` etc. Also add a `LICENSE.md` file with the image attribution/license.
3. Go to `styles/_online.manchester.ac.uk_webapps_portal.scss` and add your rule above the line that says `// add your subject code above this line`. Specify the image extension (e.g. `png`) if it's not a `jpg` file. For example:
    ```scss
	@include module-image(MATH32031);
	@include module-image(MATH32091, png);
    // add your subject code above this line
    ```
4. (No changes are needed to be made to the script itself.)
