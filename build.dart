import 'dart:convert';
import 'dart:io';

import 'package:sass/sass.dart' as sass;

/// Maps each scss file to the domains it applies to
/// (using * as a wildcard).
/// Note that the file extension is omitted.
const styles = <String, String>{
  // Blackboard Ultra
  "online.manchester.ac.uk_ultra": "*://online.manchester.ac.uk/ultra/*",
  // All non-Ultra Blackboard pages
  "online.manchester.ac.uk": "*://online.manchester.ac.uk/webapps/*",
  // Blackboard assignments/grades/etc, split across many webapps
  "online.manchester.ac.uk_webapps_bb-social-learning":
      "*://online.manchester.ac.uk/webapps/*",
  // Assessment/quizzes
  "online.manchester.ac.uk_webapps_assessment":
      "*://online.manchester.ac.uk/webapps/assessment*",
  // Calendar
  "online.manchester.ac.uk_webapps_calendar":
      "*://online.manchester.ac.uk/webapps/calendar*",
  // Rubric
  "online.manchester.ac.uk_webapps_rubric":
      "*://online.manchester.ac.uk/webapps/rubric*",
  // Embedded videos
  "video.manchester.ac.uk": "*://video.manchester.ac.uk/*",

  // IT account manager
  "iam.manchester.ac.uk": "*://iam.manchester.ac.uk/*",
  // Login page
  "login.manchester.ac.uk": "*://login.manchester.ac.uk/cas/login*",
  // Duo 2fa page (contains the Duo iframe)
  "shib.manchester.ac.uk":
      "*://shib.manchester.ac.uk/shibboleth-idp/profile/SAML2/POST/SSO*",
  // Duo iframe
  "shib.manchester.ac.uk_duo": "*://api-4c039978.duosecurity.com/frame*",
};
/// Maps each script file to the domains it applies to
/// (using * as a wildcard).
/// Note that the file extension is omitted.
const scripts = {
  'add_course_images': '*://online.manchester.ac.uk/ultra/*',
  'auto_login': '*://login.manchester.ac.uk/cas/login*',
  'video_keyboard_shortcuts': '*://video.manchester.ac.uk/embedded/*',
};

/// Copies the assets in `src/assets` to `output/assets`.
Future<void> copyAssets() async {
  print('Copying assets...');

  final assetsDir = Directory('src/assets');
  final outputDir = Directory('output/assets');
  outputDir.createSync(recursive: true);

  for (final file in assetsDir.listSync(recursive: true)) {
    if (file is! File) continue;
    final outputFile =
        File(file.path.replaceAll('src/assets', 'output/assets'));
    print('Copying ${file.path} to ${outputFile.path}');
    await outputFile.create(recursive: true);
    await outputFile.writeAsBytes(await file.readAsBytes());
  }
}

/// Compiles the scss files in `src/styles` into scripts
/// that inject the css into the page.
Future<void> compileScss() async {
  print('Compiling scss...');

  final styleInjectionTemplate =
      await File('src/style_injection.js').readAsString();

  for (final scssFilename in styles.keys) {
    final inputFile = File('src/styles/$scssFilename.scss');
    final outputFile = File('output/styles/$scssFilename.js');
    print('Compiling ${inputFile.path}');

    assert(inputFile.existsSync());

    final compiled = sass.compileToResult(inputFile.path);

    final styleInjectionJs = styleInjectionTemplate
        .replaceAll(r'${scssFilename}', scssFilename)
        .replaceAll(r'$css', jsonEncode(compiled.css));
    assert(!styleInjectionJs.contains(r'$'));

    await outputFile.create(recursive: true);
    await outputFile.writeAsString(styleInjectionJs);
  }
}

/// Copies the scripts in `src/scripts` to `output/scripts`.
Future<void> copyScripts() async {
  print('Copying scripts...');
  
  for (final jsFilename in scripts.keys) {
    final inputFile = File('src/scripts/$jsFilename.js');
    final outputFile = File('output/scripts/$jsFilename.js');
    print('Copying ${inputFile.path} to ${outputFile.path}');
    await outputFile.create(recursive: true);
    await outputFile.writeAsString(await inputFile.readAsString());
  }
}

/// Generates the manifest.json file.
Future<void> generateManifest() async {
  print('Generating manifest...');

  final inputLines = await File('src/manifest.jsonc').readAsLines();
  final outputFile = File('output/manifest.json');

  /// Remove comments from jsonc file so it can be parsed as json.
  final withoutComments =
      inputLines.where((line) => !line.trimLeft().startsWith('//')).join('\n');
  final manifest = jsonDecode(withoutComments) as Map<String, dynamic>;
  assert(manifest['name'] == 'UoM Enhancements');

  // Add content scripts for each domain
  final contentScripts = manifest['content_scripts'] as List<dynamic>;
  assert(contentScripts.isNotEmpty);
  contentScripts.addAll(
    styles.entries.map(
      (entry) => {
        'matches': [entry.value],
        'js': ['styles/${entry.key}.js'],
      },
    ),
  );
  contentScripts.addAll(
    scripts.entries.map(
      (entry) => {
        'matches': [entry.value],
        'js': ['scripts/${entry.key}.js'],
      },
    ),
  );
  manifest['content_scripts'] = contentScripts;

  final json = JsonEncoder.withIndent('  ');
  final manifestJson = json.convert(manifest);

  await outputFile.create(recursive: true);
  await outputFile.writeAsString(manifestJson);
}

Future<void> main() async {
  await copyAssets();
  await compileScss();
  await copyScripts();
  await generateManifest();
}