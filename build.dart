import 'dart:convert';
import 'dart:io';

import 'package:args/args.dart';
import 'package:sass/sass.dart' as sass;

/// Maps each scss file to the domains it applies to
/// (using * as a wildcard).
/// Note that the file extension is omitted.
const styles = <String, List<String>>{
  // Blackboard Ultra
  "online.manchester.ac.uk_ultra": [
    '*://online.manchester.ac.uk/ultra',
    "*://online.manchester.ac.uk/ultra/*",
  ],
  // All non-Ultra Blackboard pages
  "online.manchester.ac.uk": ["*://online.manchester.ac.uk/webapps/*"],
  // Blackboard assignments/grades/etc, split across many webapps
  "online.manchester.ac.uk_webapps_bb-social-learning": [
    "*://online.manchester.ac.uk/webapps/*"
  ],
  // Assessment/quizzes
  "online.manchester.ac.uk_webapps_assessment": [
    "*://online.manchester.ac.uk/webapps/assessment*"
  ],
  // Calendar
  "online.manchester.ac.uk_webapps_calendar": [
    "*://online.manchester.ac.uk/webapps/calendar*"
  ],
  // Rubric
  "online.manchester.ac.uk_webapps_rubric": [
    "*://online.manchester.ac.uk/webapps/rubric*"
  ],
  // Embedded videos
  "video.manchester.ac.uk": ["*://video.manchester.ac.uk/*"],
  // Download wrapper
  "online.manchester.ac.uk_webapps_downloadWrapper": [
    "*://online.manchester.ac.uk/webapps/blackboard/content/downloadWrapper.jsp*"
  ],

  // IT account manager
  "iam.manchester.ac.uk": ["*://iam.manchester.ac.uk/*"],
  // Login page
  "login.manchester.ac.uk": ["*://login.manchester.ac.uk/cas/login*"],
  // Duo 2fa page (contains the Duo iframe)
  "shib.manchester.ac.uk": [
    "*://shib.manchester.ac.uk/shibboleth-idp/profile/SAML2/POST/SSO*"
  ],
  // Duo iframe
  "shib.manchester.ac.uk_duo": ["*://api-4c039978.duosecurity.com/frame*"],
};

/// Maps each script file to the domains it applies to
/// (using * as a wildcard).
/// Note that the file extension is omitted.
const scripts = <String, List<String>>{
  'add_new_tab_button': ['*://online.manchester.ac.uk/ultra/*'],
  'add_course_images': ['*://online.manchester.ac.uk/ultra/*'],
  'auto_login': ['*://login.manchester.ac.uk/cas/login*'],
  'expand_menu': ['*://online.manchester.ac.uk/webapps/blackboard/content/*'],
  'video_keyboard_shortcuts': ['*://video.manchester.ac.uk/embedded/*'],
};

late final bool verbose;

/// Parses the command line arguments.
Future<void> parseArgs(List<String> args) async {
  final parser = ArgParser()..addFlag('verbose', abbr: 'v');
  final results = parser.parse(args);
  verbose = results['verbose'] as bool;
}

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
    if (verbose) print('Copying ${file.path} to ${outputFile.path}');
    await outputFile.create(recursive: true);
    await outputFile.writeAsBytes(await file.readAsBytes());
  }
}

/// Compiles the scss files in `src/styles` into
/// css files in `output/styles`.
///
/// A style injection script is also generated for each css file,
/// because Chrome deprioritises css files injected by extensions.
Future<void> compileScss() async {
  print('Compiling scss...');

  for (final scssFilename in styles.keys) {
    final scssFile = File('src/styles/$scssFilename.scss');
    final cssFile = File('output/styles/$scssFilename.css');
    final jsFile = File('output/scripts/$scssFilename.js');
    if (verbose) print('Compiling ${scssFile.path}');

    assert(scssFile.existsSync());

    final compiled = sass.compileToResult(scssFile.path);

    await cssFile.create(recursive: true);
    await cssFile.writeAsString(compiled.css);

    final jsTemplate = await File('src/style_injection.js').readAsString();
    final js = jsTemplate.replaceAll('{{cssFilename}}', '$scssFilename.css');
    await jsFile.create(recursive: true);
    await jsFile.writeAsString(js);
  }
}

/// Copies the scripts in `src/scripts` to `output/scripts`.
Future<void> copyScripts() async {
  print('Copying scripts...');

  for (final jsFilename in scripts.keys) {
    final inputFile = File('src/scripts/$jsFilename.js');
    final outputFile = File('output/scripts/$jsFilename.js');
    if (verbose) print('Copying ${inputFile.path} to ${outputFile.path}');
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
  assert(contentScripts.isEmpty);
  contentScripts.addAll(
    styles.entries.map(
      (entry) => {
        'matches': entry.value,
        'css': ['styles/${entry.key}.css'],
        'js': ['scripts/${entry.key}.js'],
        'run_at': 'document_start',
        'all_frames': true,
      },
    ),
  );
  contentScripts.addAll(
    scripts.entries.map(
      (entry) => {
        'matches': entry.value,
        'js': ['scripts/${entry.key}.js'],
        'all_frames': true,
      },
    ),
  );
  manifest['content_scripts'] = contentScripts;

  final json = JsonEncoder.withIndent('  ');
  final manifestJson = json.convert(manifest);

  await outputFile.create(recursive: true);
  await outputFile.writeAsString(manifestJson);
}

/// Zips the contents of `output` into `UoM_Enhancements.zip`.
Future<void> zip() async {
  print('Zipping...');

  final zipFile = File('UoM_Enhancements.xpi');
  final tempFile = File('${zipFile.path}~');

  if (zipFile.existsSync()) zipFile.delete();
  if (tempFile.existsSync()) tempFile.delete();

  final process = await Process.start(
    'zip',
    [if (!verbose) '-q', '-r', '../${tempFile.path}', '.'],
    workingDirectory: 'output',
  );
  await process.exitCode;

  print(await process.stdout.transform(utf8.decoder).join());

  await tempFile.rename(zipFile.path);
}

Future<void> main(List<String> args) async {
  await parseArgs(args);
  await copyAssets();
  await compileScss();
  await copyScripts();
  await generateManifest();
  await zip();
}
