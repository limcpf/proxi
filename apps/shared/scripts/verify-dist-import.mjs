const shared = await import("../dist/index.js");

const requiredExports = [
  "apiErrorSchema",
  "apiResultSchema",
  "createIsoTimestamp",
  "isNonEmptyString",
  "proxiEntityIdSchema",
  "sharedContractVersion",
  "toApiFailure",
  "toApiSuccess",
];

const missingExports = requiredExports.filter(
  (exportName) => !(exportName in shared),
);

if (missingExports.length > 0) {
  throw new Error(`Missing shared dist exports: ${missingExports.join(", ")}`);
}
