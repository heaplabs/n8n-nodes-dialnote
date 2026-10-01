#!/usr/bin/env bash
# Releases n8n-nodes-dialnote: pushes a snapshot of this folder to the public
# mirror repository, whose .github/workflows/publish.yml publishes to npm with a
# provenance attestation (npm Trusted Publishing, OIDC). The monorepo stays the
# source of truth; the mirror holds one commit per release and no other history.
#
# Run from a clean, up-to-date `main` after the version bump has merged:
#   n8n-nodes-dialnote/scripts/release-to-mirror.sh
# Then watch https://github.com/heaplabs/n8n-nodes-dialnote/actions.
set -euo pipefail

MIRROR="${MIRROR_REPO:-git@github.com:heaplabs/n8n-nodes-dialnote.git}"
PKG_DIR="$(cd "$(dirname "$0")/.." && pwd)"

die() { echo "release-to-mirror: $*" >&2; exit 1; }

for tool in git node rsync; do
  command -v "$tool" >/dev/null 2>&1 || die "$tool is required and was not found on PATH"
done

cd "$PKG_DIR"
branch="$(git rev-parse --abbrev-ref HEAD)"
[ "$branch" = "main" ] || die "run from main (currently on $branch)"
[ -z "$(git status --porcelain -- .)" ] || die "n8n-nodes-dialnote/ has uncommitted changes"
git fetch -q origin main
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] || die "main is not up to date with origin/main"

version="$(node -p "require('./package.json').version")"
source_sha="$(git rev-parse --short HEAD)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

git clone -q --depth 1 "$MIRROR" "$tmp/mirror"
if git -C "$tmp/mirror" ls-remote --tags origin "refs/tags/$version" | grep -q .; then
  die "tag $version already exists on the mirror; bump the version first"
fi

# Replace the mirror's tree with this folder, minus build output and dependencies.
find "$tmp/mirror" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
rsync -a --exclude node_modules --exclude dist ./ "$tmp/mirror/"

cd "$tmp/mirror"
git add -A
git commit -q -m "n8n-nodes-dialnote $version" -m "Snapshot of heaplabs/sr_call_app@$source_sha n8n-nodes-dialnote/."
git tag "$version"
git push -q origin HEAD:main "$version"
echo "Pushed $version to $MIRROR; publish.yml is now building it with provenance."
