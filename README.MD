# M2 Media Site

Static bilingual website built with Jekyll data and Liquid templates.

## Copy Source

Editable bilingual copy for the centralized pages lives in:

- `_data/copy.json`

The current build-time centralized scope covers:

- `es/en` homepage
- `es/en` about
- `es/en` contact
- `es/en/projects/dolarplus`

## Local Build

1. Install gems:

```bash
bundle install --path vendor/bundle
```

2. Build the static site:

```bash
bundle exec jekyll build
```

3. Serve the generated output if needed:

```bash
cd _site
python3 -m http.server 4174
```

## Notes

- The deployed output remains static HTML/CSS/JS.
- Page copy for the centralized routes is resolved at build time, not injected at runtime.
