#!/usr/bin/env bash
set -euo pipefail

export PATH="${HOME}/.local/bin:${HOME}/.local/share/gem/ruby/4.0.0/bin:${PATH}"
export LD_LIBRARY_PATH="${HOME}/.local/lib:${LD_LIBRARY_PATH:-}"

VERSION="0.1.0"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"
RELEASES_DIR="${DIST_DIR}/releases"
ASSETS_DIR="${ROOT_DIR}/assets"
FPM="${HOME}/.local/share/gem/ruby/4.0.0/bin/fpm"
APPIMAGETOOL="${HOME}/.local/bin/appimagetool"

echo "==> Iniciando empacotamento completo do Daisy File Manager v${VERSION}"
mkdir -p "${RELEASES_DIR}"

# 1. Compilar binários nativos com Bun se ainda não existirem
if [ ! -f "${DIST_DIR}/daisy-linux-x64" ] || [ ! -f "${DIST_DIR}/daisy-linux-x64-musl" ]; then
  echo "==> Compilando binários nativos com bun run build..."
  cd "${ROOT_DIR}"
  bun run build
fi

# Garantir ícones e desktop file
if [ ! -f "${ASSETS_DIR}/daisy.png" ]; then
  echo "==> Gerando ícone daisy.png..."
  ffmpeg -y -i "${ASSETS_DIR}/daisy.svg" "${ASSETS_DIR}/daisy.png"
fi

# 2. Gerar Tarballs Standalone (.tar.gz)
echo "==> Criando tarballs dos binários standalone..."
tar -czf "${RELEASES_DIR}/daisy-v${VERSION}-linux-x64.tar.gz" \
  -C "${DIST_DIR}" daisy-linux-x64 \
  -C "${ROOT_DIR}" LICENSE README.md

tar -czf "${RELEASES_DIR}/daisy-v${VERSION}-linux-x64-musl.tar.gz" \
  -C "${DIST_DIR}" daisy-linux-x64-musl \
  -C "${ROOT_DIR}" LICENSE README.md

# 3. Gerar pacote Debian / Ubuntu (.deb)
echo "==> Gerando pacote Debian (.deb)..."
DEB_PATH="${RELEASES_DIR}/daisy_${VERSION}_amd64.deb"
rm -f "${DEB_PATH}"
"${FPM}" -s dir -t deb \
  -n daisy-file-manager \
  -v "${VERSION}" \
  --architecture x86_64 \
  --maintainer "raillen <https://github.com/raillen>" \
  --description "Nautilus-style TUI File Manager built with OpenTUI and Solid.js" \
  --url "https://github.com/raillen/daisy-file-manager" \
  --license "MIT" \
  --category "utils" \
  -p "${DEB_PATH}" \
  "${DIST_DIR}/daisy-linux-x64=/usr/bin/daisy-files-files" \
  "${ASSETS_DIR}/daisy.desktop=/usr/share/applications/daisy-files.desktop" \
  "${ASSETS_DIR}/daisy.png=/usr/share/icons/hicolor/128x128/apps/daisy-files.png" \
  "${ASSETS_DIR}/daisy.svg=/usr/share/icons/hicolor/scalable/apps/daisy-files.svg" \
  "${ROOT_DIR}/LICENSE=/usr/share/doc/daisy-file-manager/copyright"

# 4. Gerar pacote Fedora / RHEL (.rpm)
echo "==> Gerando pacote Fedora (.rpm)..."
RPM_PATH="${RELEASES_DIR}/daisy-${VERSION}-1.x86_64.rpm"
rm -f "${RPM_PATH}"
"${FPM}" -s dir -t rpm \
  -n daisy-file-manager \
  -v "${VERSION}" \
  --iteration 1 \
  --architecture x86_64 \
  --maintainer "raillen <https://github.com/raillen>" \
  --description "Nautilus-style TUI File Manager built with OpenTUI and Solid.js" \
  --url "https://github.com/raillen/daisy-file-manager" \
  --license "MIT" \
  -p "${RPM_PATH}" \
  "${DIST_DIR}/daisy-linux-x64=/usr/bin/daisy-files-files" \
  "${ASSETS_DIR}/daisy.desktop=/usr/share/applications/daisy-files.desktop" \
  "${ASSETS_DIR}/daisy.png=/usr/share/icons/hicolor/128x128/apps/daisy-files.png" \
  "${ASSETS_DIR}/daisy.svg=/usr/share/icons/hicolor/scalable/apps/daisy-files.svg" \
  "${ROOT_DIR}/LICENSE=/usr/share/licenses/daisy-file-manager/LICENSE"

# 5. Gerar pacote Arch Linux (.pkg.tar.zst)
echo "==> Gerando pacote Arch Linux (.pkg.tar.zst)..."
ARCH_PATH="${RELEASES_DIR}/daisy-file-manager-${VERSION}-1-x86_64.pkg.tar.zst"
rm -f "${ARCH_PATH}"
"${FPM}" -s dir -t pacman \
  -n daisy-file-manager \
  -v "${VERSION}" \
  --iteration 1 \
  --architecture x86_64 \
  --maintainer "raillen <https://github.com/raillen>" \
  --description "Nautilus-style TUI File Manager built with OpenTUI and Solid.js" \
  --url "https://github.com/raillen/daisy-file-manager" \
  --license "MIT" \
  -p "${ARCH_PATH}" \
  "${DIST_DIR}/daisy-linux-x64=/usr/bin/daisy-files-files" \
  "${ASSETS_DIR}/daisy.desktop=/usr/share/applications/daisy-files.desktop" \
  "${ASSETS_DIR}/daisy.png=/usr/share/icons/hicolor/128x128/apps/daisy-files.png" \
  "${ASSETS_DIR}/daisy.svg=/usr/share/icons/hicolor/scalable/apps/daisy-files.svg" \
  "${ROOT_DIR}/LICENSE=/usr/share/licenses/daisy-file-manager/LICENSE"

# Gerar PKGBUILD para Arch AUR
cat << 'PKGBUILD_EOF' > "${RELEASES_DIR}/PKGBUILD"
# Maintainer: raillen <https://github.com/raillen>
pkgname=daisy-file-manager-bin
pkgver=0.1.0
pkgrel=1
pkgdesc="Nautilus-style TUI File Manager built with OpenTUI and Solid.js"
arch=('x86_64')
url="https://github.com/raillen/daisy-file-manager"
license=('MIT')
provides=('daisy-file-manager')
conflicts=('daisy-file-manager')
source=("https://github.com/raillen/daisy-file-manager/releases/download/v${pkgver}/daisy-v${pkgver}-linux-x64.tar.gz")
sha256sums=('SKIP')

package() {
    install -Dm755 "${srcdir}/daisy-linux-x64" "${pkgdir}/usr/bin/daisy-files-files"
    install -Dm644 "${srcdir}/LICENSE" "${pkgdir}/usr/share/licenses/${pkgname}/LICENSE"
}
PKGBUILD_EOF

# 6. Gerar AppImage (.AppImage)
echo "==> Gerando AppImage..."
APPDIR="/tmp/daisy-AppDir"
rm -rf "${APPDIR}"
mkdir -p "${APPDIR}/usr/bin" "${APPDIR}/usr/share/icons/hicolor/128x128/apps" "${APPDIR}/usr/share/applications"

cp "${DIST_DIR}/daisy-linux-x64" "${APPDIR}/usr/bin/daisy-files-files"
cp "${ASSETS_DIR}/daisy.desktop" "${APPDIR}/daisy-files.desktop"
cp "${ASSETS_DIR}/daisy.desktop" "${APPDIR}/usr/share/applications/daisy-files.desktop"
cp "${ASSETS_DIR}/daisy.png" "${APPDIR}/daisy-files.png"
cp "${ASSETS_DIR}/daisy.png" "${APPDIR}/usr/share/icons/hicolor/128x128/apps/daisy-files.png"
cp "${ASSETS_DIR}/daisy.png" "${APPDIR}/.DirIcon"

cat << 'APPRUN_EOF' > "${APPDIR}/AppRun"
#!/bin/sh
SELF=$(readlink -f "$0")
HERE=${SELF%/*}
export PATH="${HERE}/usr/bin:${PATH}"
exec "${HERE}/usr/bin/daisy-files-files" "$@"
APPRUN_EOF
chmod +x "${APPDIR}/AppRun"

APPIMAGE_PATH="${RELEASES_DIR}/Daisy-File-Manager-${VERSION}-x86_64.AppImage"
rm -f "${APPIMAGE_PATH}"
ARCH=x86_64 "${APPIMAGETOOL}" --appimage-extract-and-run "${APPDIR}" "${APPIMAGE_PATH}"
rm -rf "${APPDIR}"

# 7. Gerar Pacote Flatpak (.flatpak e Manifest)
echo "==> Gerando Flatpak Bundle..."
FLATPAK_DIR="/tmp/daisy-flatpak-build"
FLATPAK_REPO="/tmp/daisy-flatpak-repo"
rm -rf "${FLATPAK_DIR}" "${FLATPAK_REPO}"
mkdir -p "${FLATPAK_DIR}" "${FLATPAK_REPO}"

flatpak build-init "${FLATPAK_DIR}" org.daisy.FileManager org.freedesktop.Platform org.freedesktop.Platform 25.08
mkdir -p "${FLATPAK_DIR}/files/bin" "${FLATPAK_DIR}/files/share/applications" "${FLATPAK_DIR}/files/share/icons/hicolor/128x128/apps"

cp "${DIST_DIR}/daisy-linux-x64" "${FLATPAK_DIR}/files/bin/daisy"
cp "${ASSETS_DIR}/daisy.desktop" "${FLATPAK_DIR}/files/share/applications/org.daisy.FileManager.desktop"
cp "${ASSETS_DIR}/daisy.png" "${FLATPAK_DIR}/files/share/icons/hicolor/128x128/apps/org.daisy.FileManager.png"

flatpak build-finish "${FLATPAK_DIR}" \
  --command=daisy-files \
  --filesystem=host \
  --device=all \
  --share=ipc \
  --share=network

flatpak build-export "${FLATPAK_REPO}" "${FLATPAK_DIR}"

FLATPAK_BUNDLE_PATH="${RELEASES_DIR}/daisy-file-manager-${VERSION}-x86_64.flatpak"
rm -f "${FLATPAK_BUNDLE_PATH}"
flatpak build-bundle "${FLATPAK_REPO}" "${FLATPAK_BUNDLE_PATH}" org.daisy.FileManager
rm -rf "${FLATPAK_DIR}" "${FLATPAK_REPO}"

# Criar Manifesto Flatpak oficial
cat << 'MANIFEST_EOF' > "${RELEASES_DIR}/org.daisy.FileManager.yaml"
app-id: org.daisy.FileManager
runtime: org.freedesktop.Platform
runtime-version: '25.08'
sdk: org.freedesktop.Platform
command: daisy-files

finish-args:
  - --filesystem=host
  - --device=all
  - --share=ipc
  - --share=network

modules:
  - name: daisy
    buildsystem: simple
    build-commands:
      - install -Dm755 daisy-linux-x64 /app/bin/daisy-files
      - install -Dm644 daisy.desktop /app/share/applications/org.daisy.FileManager.desktop
      - install -Dm644 daisy.png /app/share/icons/hicolor/128x128/apps/org.daisy.FileManager.png
    sources:
      - type: file
        path: daisy-linux-x64
      - type: file
        path: daisy.desktop
      - type: file
        path: daisy.png
MANIFEST_EOF

# 8. Gerar Checksums SHA256
echo "==> Gerando somas de verificação SHA-256..."
cd "${RELEASES_DIR}"
sha256sum *.{deb,rpm,pkg.tar.zst,AppImage,flatpak,tar.gz} > "${RELEASES_DIR}/SHA256SUMS.txt" 2>/dev/null || true

echo "==> Empacotamento concluído com sucesso!"
ls -lh "${RELEASES_DIR}"
