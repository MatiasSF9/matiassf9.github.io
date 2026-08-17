#!/usr/bin/env bash
# Downloads the self-hosted webfonts referenced by assets/css/style.css
# (Space Grotesk 400/500/600/700, Playfair Display 500/600, Roboto 400/500/700)
# into assets/fonts/, matching the @font-face `src` filenames exactly.
#
# Usage: chmod +x tools/fetch-fonts.sh && ./tools/fetch-fonts.sh
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
OUT_DIR="assets/fonts"
mkdir -p "$OUT_DIR"

# A modern-browser UA is required so Google's CSS2 API returns woff2 (not woff/ttf).
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

# family-slug|google-family-param|weight|output-basename
FONTS=(
  "Space+Grotesk:wght@400|space-grotesk-400"
  "Space+Grotesk:wght@500|space-grotesk-500"
  "Space+Grotesk:wght@600|space-grotesk-600"
  "Space+Grotesk:wght@700|space-grotesk-700"
  "Playfair+Display:wght@500|playfair-display-500"
  "Playfair+Display:wght@600|playfair-display-600"
  "Roboto:wght@400|roboto-400"
  "Roboto:wght@500|roboto-500"
  "Roboto:wght@700|roboto-700"
)

for entry in "${FONTS[@]}"; do
  family_param="${entry%%|*}"
  out_name="${entry##*|}"
  css_url="https://fonts.googleapis.com/css2?family=${family_param}&display=swap"

  echo "Fetching CSS for ${out_name}..."
  css="$(curl -sf -A "$UA" "$css_url")"

  # Pull the first woff2 src url out of the returned @font-face block.
  woff2_url="$(printf '%s' "$css" | grep -o "https://fonts.gstatic.com/[^)]*\.woff2" | head -n1)"

  if [[ -z "$woff2_url" ]]; then
    echo "ERROR: could not find a woff2 url for ${out_name}" >&2
    exit 1
  fi

  echo "Downloading ${out_name}.woff2..."
  curl -sf -A "$UA" -o "${OUT_DIR}/${out_name}.woff2" "$woff2_url"
done

echo "Done. Fonts written to ${OUT_DIR}/"
