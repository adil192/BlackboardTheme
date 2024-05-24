#!/usr/bin/env dart

/// Bumps the version number in each manifest_*.jsonc file
/// and adds the previous version number to update_manifest.json.

import 'dart:convert';
import 'dart:io';

import 'package:args/args.dart';

final firefoxManifestFile = File('src/manifest_firefox.jsonc');
final chromeManifestFile = File('src/manifest_chrome.jsonc');

class Version {
  final int year;
  final int month;
  final int day;
  final int revision;

  Version(this.year, this.month, this.day, this.revision);
  factory Version.parse(String version) {
    final parts = version.split('.');
    if (parts.length != 4) {
      throw ArgumentError('Invalid version: $version');
    }
    return Version(
      int.parse(parts[0]),
      int.parse(parts[1]),
      int.parse(parts[2]),
      int.parse(parts[3]),
    );
  }

  @override
  String toString() => '$year.$month.$day.$revision';
}

abstract class Args {
  static Version? newVersion;
  static Version? oldVersion;
  static bool updateManifest = true;

  static String _toString() {
    return 'Args: { newVersion: $newVersion, oldVersion: $oldVersion, updateManifest: $updateManifest }';
  }
}

/// Parses the command line arguments,
/// and populates [Args] with the results.
Future<void> parseArgs(List<String> args) async {
  final parser = ArgParser()
    ..addOption('version',
        abbr: 'v',
        help:
            'The new version number. If not provided, the version will be bumped automatically.')
    ..addOption('old-version',
        abbr: 'o',
        help:
            'The old version number. If not provided, the version will be read from src/manifest_firefox.jsonc.')
    ..addFlag('update-manifest',
        abbr: 'u',
        help: 'Whether to add the old version to update_manifest.json.',
        defaultsTo: true,
        negatable: true);

  final results = parser.parse(args);
  if (results['version'] != null) {
    Args.newVersion = Version.parse(results['version']);
  }
  if (results['old-version'] != null) {
    Args.oldVersion = Version.parse(results['old-version']);
  }
  if (results['update-manifest'] != null) {
    Args.updateManifest = results['update-manifest'] as bool;
  }

  print(Args._toString());
}

Version bumpOldVersion(Version oldVersion) {
  final now = DateTime.now().toUtc();
  // If oldVersion wasn't today, use today's date with revision 0.
  if (now.year > oldVersion.year ||
      now.month > oldVersion.month ||
      now.day > oldVersion.day) {
    return Version(now.year, now.month, now.day, 0);
  }
  // If oldVersion was today, increment the revision.
  return Version(
    oldVersion.year,
    oldVersion.month,
    oldVersion.day,
    oldVersion.revision + 1,
  );
}

Future<void> addOldVersionToUpdateManifest(Version oldVersion) async {
  final updateManifestFile = File('update_manifest.json');
  final updateManifest = jsonDecode(await updateManifestFile.readAsString());
  final updatesList = updateManifest['addons']
      ['{300f03ef-d037-4626-9e39-0823ff5d7a9b}']['updates'] as List;

  if (updatesList.any((update) => update['version'] == oldVersion.toString())) {
    print('$oldVersion already exists in update_manifest.json');
    return;
  } else {
    print('Adding $oldVersion to update_manifest.json');
  }

  updatesList.add({
    'version': oldVersion.toString(),
    'update_link':
        'https://github.com/adil192/BlackboardTheme/releases/download/$oldVersion/UoM_Enhancements.xpi',
    'update_info_url':
        'https://github.com/adil192/BlackboardTheme/blob/main/CHANGELOG.md',
  });
  await updateManifestFile.writeAsString(
    JsonEncoder.withIndent('\t').convert(updateManifest),
  );
}

Future<void> updateManifestFile(
    File manifestFile, Version oldVersion, Version newVersion) async {
  final newManifest = (await manifestFile.readAsLines())
      .map((line) => line.contains('"version":')
          ? line.replaceFirst(oldVersion.toString(), newVersion.toString())
          : line)
      .join('\n');
  await manifestFile.writeAsString(newManifest);
}

Future<void> main(List<String> args) async {
  await parseArgs(args);

  if (Args.oldVersion == null) {
    for (final line in await firefoxManifestFile.readAsLines()) {
      if (line.contains('"version":')) {
        final oldVersionString =
            line.split(':').last.replaceAll(',', '').replaceAll('"', '').trim();
        print('Old version: $oldVersionString');
        Args.oldVersion = Version.parse(oldVersionString);
        break;
      }
    }
    if (Args.oldVersion == null) {
      throw StateError('Could not find version in ${firefoxManifestFile.path}');
    }
  }

  if (Args.newVersion == null) {
    Args.newVersion = await bumpOldVersion(Args.oldVersion!);
    print('New version: ${Args.newVersion}');
  }

  await addOldVersionToUpdateManifest(Args.oldVersion!);

  if (Args.updateManifest) {
    await updateManifestFile(
        firefoxManifestFile, Args.oldVersion!, Args.newVersion!);
    await updateManifestFile(
        chromeManifestFile, Args.oldVersion!, Args.newVersion!);
  }

  print('');
  print('Make sure to update ./CHANGELOG.md');
}
