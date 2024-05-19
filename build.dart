#!/usr/bin/env dart

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

  // Leanpub
  "leanpub.com": ["*://leanpub.com/*"],
};

/// Maps each script file to the domains it applies to
/// (using * as a wildcard).
/// Note that the file extension is omitted.
const scripts = <String, List<String>>{
  'add_new_tab_button': [
    '*://online.manchester.ac.uk/ultra',
    '*://online.manchester.ac.uk/ultra/*'
  ],
  'add_course_images': [
    '*://online.manchester.ac.uk/ultra',
    '*://online.manchester.ac.uk/ultra/*'
  ],
  'amplify_videos': ['*://video.manchester.ac.uk/embedded/*'],
  'auto_login': ['*://login.manchester.ac.uk/cas/login*'],
  'expand_menu': ['*://online.manchester.ac.uk/webapps/blackboard/content/*'],
  'save_scroll_pos': ['*://leanpub.com/*/read*'],
  'video_keyboard_shortcuts': ['*://video.manchester.ac.uk/embedded/*'],
};

/// Whether to print extra information.
late final bool verbose;

/// Whether to watch the src directory for changes,
/// and rebuild when changes are detected.
late final bool shouldWatchSrc;

/// Whether to use Manifest V3.
/// If false, Manifest V2 is used.
late final bool useManifestV3;

/// Parses the command line arguments.
Future<void> parseArgs(List<String> args) async {
  final parser = ArgParser()
    ..addFlag('verbose', abbr: 'v')
    ..addFlag('watch', abbr: 'w')
    ..addFlag('firefox', abbr: 'f')
    ..addFlag('chrome', abbr: 'c');
  final results = parser.parse(args);
  verbose = results['verbose'] as bool;
  shouldWatchSrc = results['watch'] as bool;

  if (results['firefox'] as bool) {
    // Firefox for Android doesn't fully support Manifest V3
    useManifestV3 = false;
  } else if (results['chrome'] as bool) {
    // Chrome Web Store requires Manifest V3
    useManifestV3 = true;
  } else {
    print('--firefox or --chrome not specified, defaulting to --firefox');
    useManifestV3 = false;
  }
}

/// Creates the `output` directory if it doesn't exist,
/// and deletes its contents if it does.
Future<void> clearOutput() async {
  final outputDir = Directory('output');
  if (!outputDir.existsSync()) {
    if (verbose) print('Creating ${outputDir.path} folder');
    await outputDir.create();
  } else {
    if (verbose) print('Clearing ${outputDir.path} folder');
    await for (final entity in outputDir.list()) {
      await entity.delete(recursive: true);
    }
  }
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

/// Copies the `src/styles` directory to `output/src/styles`.
/// This is so that the scss files are available for debugging.
Future<void> copySrcStyles() async {
  print('Copying src/styles...');

  final srcDir = Directory('src/styles');
  final outputDir = Directory('output/src/styles');
  outputDir.createSync(recursive: true);

  for (final file in srcDir.listSync(recursive: true)) {
    if (file is! File) continue;
    final outputFile =
        File(file.path.replaceAll('src/styles', 'output/src/styles'));
    if (verbose) print('Copying ${file.path} to ${outputFile.path}');
    await outputFile.create(recursive: true);
    await outputFile.writeAsString(await file.readAsString());
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
    final inputScssFile = File('src/styles/$scssFilename.scss');
    final outputCssFile = File('output/styles/$scssFilename.css');
    final outputCssMapFile = File('output/styles/$scssFilename.css.map');
    final outputJsFile = File('output/styles/$scssFilename.js');

    if (verbose) print('Compiling ${inputScssFile.path}');

    assert(inputScssFile.existsSync());
    final compiled = sass.compileToResult(inputScssFile.path, sourceMap: true);

    await outputCssFile.create(recursive: true);
    final sourceMappingLine = '\n/*# sourceMappingURL=$scssFilename.css.map */';
    await outputCssFile.writeAsString(compiled.css + sourceMappingLine);

    // add .css.map and .scss files for dev tools
    final sourceMap = compiled.sourceMap!.toJson();
    sourceMap["sources"] = (sourceMap["sources"] as List<String>).map((source) {
      if (!source.startsWith('file://')) return source;
      // crop to just src/styles/...
      final index = source.indexOf('src/styles/');
      assert(index != -1, 'source map source not in src/styles/');
      // in the form of ../src/styles/...
      return '../' + source.substring(index);
    }).toList();
    await outputCssMapFile.writeAsString(jsonEncode(sourceMap));

    final jsTemplate = await File('src/style_injection.js').readAsString();
    final js = jsTemplate.replaceAll('{{cssFilename}}', '$scssFilename.css');
    await outputJsFile.writeAsString(js);
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

  final manifestTemplate = useManifestV3
      ? File('src/manifest_chrome.jsonc')
      : File('src/manifest_firefox.jsonc');
  final inputLines = await manifestTemplate.readAsLines();
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
        'js': ['styles/${entry.key}.js'],
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

/// Zips the contents of `output` into `UoM_Enhancements.zip`,
/// and returns the size of the zip file in bytes.
Future<int> zip() async {
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

  final stdout = await process.stdout.transform(utf8.decoder).join();
  if (stdout.isNotEmpty) print(stdout);
  final stderr = await process.stderr.transform(utf8.decoder).join();
  if (stderr.isNotEmpty) print(stderr);

  await tempFile.rename(zipFile.path);

  return await zipFile.length();
}

Future<void> build() async {
  final stopwatch = Stopwatch()..start();
  await clearOutput();
  await copyAssets();
  await copySrcStyles();
  await compileScss();
  await copyScripts();
  await generateManifest();
  final size = await zip();
  stopwatch.stop();

  final prettySize = _prettySize(size.toDouble());
  print('Built a $prettySize xpi in ${stopwatch.elapsedMilliseconds / 1000}s');
}

String _prettySize(double size) {
  final units = ['B', 'KB', 'MB', 'GB', 'TB'];
  var unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return '${size.toStringAsFixed(2)} ${units[unitIndex]}';
}

Future<void> watchSrc() async {
  print('\nWatching src directory for changes...');

  bool needsRebuild = false;
  bool isBuilding = false;

  void watchedRebuild() async {
    // Don't rebuild if we're already building
    if (isBuilding) return;
    if (!needsRebuild) return;

    // Rebuild
    needsRebuild = false;
    isBuilding = true;
    try {
      await build();
    } catch (e, stackTrace) {
      print('Error while building:');
      print(e);
      print(stackTrace);
    }
    isBuilding = false;

    // Check if we need to rebuild again
    // (i.e. a file was changed while we were last building)
    watchedRebuild();
  }

  await for (final entity in Directory('src').list(recursive: true)) {
    if (entity is! Directory) continue;
    entity.watch().listen((event) {
      needsRebuild = true;
      watchedRebuild();
    });
  }
}

Future<void> main(List<String> args) async {
  await parseArgs(args);
  await build();

  if (shouldWatchSrc) await watchSrc();
}
