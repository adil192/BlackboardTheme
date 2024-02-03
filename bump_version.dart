/// Bumps the version number in src/manifest.jsonc,
/// and adds the previous version number to update_manifest.json.

import 'dart:convert';
import 'dart:io';

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

/// Parses the command line arguments.
Future<Version> getNewVersion(List<String> args, Version oldVersion) async {
  if (args.length > 1) {
    throw ArgumentError('Expected at most 1 argument, got ${args.length}');
  }
  if (args.length == 1) {
    return Version.parse(args.first);
  }

  final now = DateTime.now().toUtc();
  if (now.year > oldVersion.year ||
      now.month > oldVersion.month ||
      now.day > oldVersion.day) {
    return Version(now.year, now.month, now.day, 0);
  }
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

Future<void> main(List<String> args) async {
  final manifestFile = File('src/manifest.jsonc');
  final manifest = await manifestFile.readAsLines();

  // Add an empty line to the end of the file if it doesn't exist.
  if (manifest.last != '') manifest.add('');

  Version? oldVersion;
  for (final line in manifest) {
    if (line.contains('"version":')) {
      final oldVersionString =
          line.split(':').last.replaceAll(',', '').replaceAll('"', '').trim();
      print('Old version: $oldVersionString');
      oldVersion = Version.parse(oldVersionString);
      break;
    }
  }
  if (oldVersion == null) {
    throw StateError('Could not find version in manifest.jsonc');
  }

  final newVersion = await getNewVersion(args, oldVersion);
  print('New version: $newVersion');

  await addOldVersionToUpdateManifest(oldVersion);

  final newManifest = manifest
          .map((line) => line.contains('"version":')
              ? line.replaceFirst(oldVersion.toString(), newVersion.toString())
              : line)
          .join('\n');
  await manifestFile.writeAsString(newManifest);
}
