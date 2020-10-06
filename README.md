# Kéktúra szakaszok

A web app for generating `.KML` tracks for the [National Blue Trail](https://en.wikipedia.org/wiki/National_Blue_Trail) hike path in Hungary.

## Prerequisites

* node.js 12 with yarn package manager
* Ruby 2.6.3
* GNU Make

## Installation

```bash
git clone git@github.com:lencse/kektura-szakaszok.git
cd kektura-szakaszok
bundle install
make
```

## Development mode

```bash
make watch
```

If you're changing the data fetching script:

```bash
make watch && make watch_data:
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
