# UoM Blackboard theme

This project applies [Google's Material Design](https://m3.material.io/) to
the University of Manchester's websites.

This is more than just a theme; it also vastly improves the usability
and readability of the websites.

I was originally only restyling Blackboard, but I've since expanded it to
other UoM websites.

[![CodeFactor](https://www.codefactor.io/repository/github/adil192/blackboardtheme/badge)](https://www.codefactor.io/repository/github/adil192/blackboardtheme)

## Install

In the future, you'll be able to install this as an extension on Firefox and Chrome.

Want to build the extension yourself? See the [Building](#building) section. 

### Install styling

- Install Stylus [for Firefox](https://addons.mozilla.org/en-GB/firefox/addon/styl-us/) or [for Chrome](https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne) depending on your browser.
- Go to https://userstyles.world/style/4931/uom-blackboard-theme and click on the Install button.

### Install optional scripts

- Install Tampermonkey [for Firefox](https://addons.mozilla.org/en-GB/firefox/addon/tampermonkey/) or [for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- Go to each of these links and click on the Install button:
    - [Highlight current modules](https://greasyfork.org/en/scripts/478967-uom-blackboard-highlight-current-modules)
    - [Video keyboard shortcuts](https://greasyfork.org/en/scripts/479044-uom-blackboard-video-keyboard-shortcuts)
    - [Module list images](https://greasyfork.org/en/scripts/479199-uom-blackboard-add-course-images)
    - [Auto login](https://greasyfork.org/en/scripts/485669-uom-blackboard-auto-login)

## Install via extension

In the future, this project will be available on the Firefox and Chrome extension stores.
This installation method is a 1-click install and will automatically update,
but needs to be reviewed by the extension store maintainers first.

For now, you can install it manually on:

#### Firefox
You need Firefox Developer or Nightly (not the regular Firefox) to install this extension because it isn't signed yet.

Go to the latest build from the [Actions tab](https://github.com/adil192/BlackboardTheme/actions) and download the `output` artifact.
You'll get an `output.zip` file. Don't unzip it.

Go to [about:addons](about:addons) in Firefox and click on the gear icon in the top right corner.
Select "Install Add-on From File..." and select the `output.zip` file you downloaded earlier.

#### Chrome

Go to the latest build from the [Actions tab](https://github.com/adil192/BlackboardTheme/actions) and download the `output` artifact.
You'll get an `output.zip` file. Unzip it somewhere safe, like your Documents folder.

Go to [chrome://extensions](chrome://extensions) in Chrome and enable "Developer mode" in the top right corner.
Click on "Load unpacked" and select the unzipped `output` folder.

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

<details open>
<summary>Blackboard (Grid view)</summary>

![Blackboard](screenshots/blackboard-grid.png)
</details>
<details open>
<summary>Blackboard (List view)</summary>

![Blackboard](screenshots/blackboard-list.png)
</details>
<details open>
<summary>Course page</summary>

![Course page](screenshots/course.png)
</details>
<details open>
<summary>Assessments</summary>

![Assessments](screenshots/quiz.png)
</details>
<details open>
<summary>Login</summary>

![Login](screenshots/login.png)
</details>
<details open>
<summary>Duo 2FA</summary>

![Duo 2FA](screenshots/duo.png)
</details>
<details open>
<summary>Video player</summary>

![Video player](screenshots/video.png)
</details>
<details open>
<summary>IT Account Manager</summary>

![IT Account Manager](screenshots/iam.png)
</details>

## Development notes

#### Building

1. Install the latest version of Dart via https://dart.dev/get-dart. If you have Flutter installed, you already have Dart. 

2. Install this project's dependencies (including the Dart Sass compiler) by running `pub get` in the project root.

3. Build the project by running `dart build.dart` in the project root.

4. The result is the `UoM_Enhancements.xpi` file. It can also be found unzipped in the `output` folder.

#### Adding a new subject to the [Module list images](https://greasyfork.org/en/scripts/479199-uom-blackboard-add-course-images) script

Unknown subjects are given an image from the [Pixabay API](https://pixabay.com/api/docs/).

If you want to add a custom image for your subject(s) to the
[Module list images](https://greasyfork.org/en/scripts/479199-uom-blackboard-add-course-images)
script, you can either
[submit an issue](https://github.com/adil192/BlackboardTheme/issues/new)
and I'll add it for you;
or you can do it yourself and submit a pull request:

1. Identify the module code. An example module code is `ABCD10000`.
2. Add an image to the `assets/subjects/ABCD10000/` folder where `ABCD10000` is the subject/module code (you'll need to make this folder). The image must be named `ABCD10000.jpg` or `ABCD10000.png` etc. Also add a `LICENSE.md` file with the image attribution/license.
3. Go to `scripts/add_course_images.js` and add a line to the `knownModuleImages` object. For example:
    ```js
    const knownModuleImages = {
        // ...
        "ABCD10000" : "../assets/subjects/ABCD10000/ABCD10000.jpg",
    };
    ```
