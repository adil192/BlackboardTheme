# UoM Enhancements (previously BlackboardTheme): Privacy Policy

UoM Enhancements (previously BlackboardTheme) is collection of enhancements to the University of Manchester's websites including Blackboard,
in the form of a browser extension.

This extension does not collect or share any data, except for the use of the Pixabay API.

## Pixabay API

The Pixabay API is used to get images for most modules.
(A few modules have custom images you can find in [src/assets](https://github.com/adil192/BlackboardTheme/tree/main/src/assets), which are bundled in the extension itself.)

The [add_course_images.js](https://github.com/adil192/BlackboardTheme/blob/main/src/scripts/add_course_images.js)
script follows these steps to get an image for a module:

1. The module's name is extracted from the Blackboard page, e.g. `COMP10120 First Year Team Project 2021-22 Full Year`.
2. The script finds up to 2 of the most important keywords in the module name, e.g. `Team Project`.
3. The script searches Pixabay for images matching the keywords, with the image type set to `photo`, safe-search enabled, orientation set to `horizontal`.
4. The script picks the first image from the results, and stores it in a local database.

You can view more about how Pixabay uses your data in their [privacy policy](https://pixabay.com/service/privacy/).
