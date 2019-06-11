# Sensotred Converter

This repository contains a package that converts data related to type 1 between
different formats. The package is _not_ intended to retain the exact same data structures
when data is converted to another format and then back - the conversion process aims to
retain the specific data fields related to diabetes care. The fields that are retained
across the conversion are

1. Blood glucose information from CGM and glucometer devices
2. Carbohydrate treatment information
3. Insulin dosing information

For insulin treatments, the package currently only supports the conversion of insulin boluses.

The package uses ES8 Javascript features, so Node 12 or newer is required to use this package.

# Supported formats

The package currently supports the following JSON formats

1. Nightscout
2. Tidepool Uploader wire format
3. FHIR (specifically, records in the Kela Omatietovaranto profile format)

# Usage

Instantiate the default converter with

```
import { DefaultConverter } from '../src/index.js';
const Converter = DefaultConverter();

const options = {
    source: 'nightscout',
    target: 'fiphr',
    datatypehint: 'entries', // Nightscout converter requires data type hint ('entries' or 'treatments')
    FHIR_userid: userid // Needed for FHIR conversion
};

const entries = { ... }; // Data from Nightscout Entries collection
const records = await DataConverter.convert(entries, options);
```

# Logging

`DefaultConverter()` optionally accepts a logger parameter, which is assumed to have the
`info()` and `error()` methods, such as `winston`.

# Unit tests & code coverage reporting

The repository uses nyc and Mocha to run unit tests found in the /tests. Run the tests with 'npm test'. Run code coverage report by running 'npm run-script coverage'. Get full HTML output with 'npm run-script coverage-html'.
