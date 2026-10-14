#!/usr/bin/env bash
# ==============================================================================
# 🌼 Daisy File Manager — Script Oficial de Instalação One-Line
# Repositório: https://github.com/raillen/daisy-file-manager
# ==============================================================================

# Cores e formatação
setup_colors() {
  if [ -t 1 ] && [ -n "${TERM:-}" ] && [ "${TERM:-}" != "dumb" ]; then
    COLOR_RESET="\033[0m"
    COLOR_BOLD="\033[1m"
    COLOR_DIM="\033[2m"
    COLOR_YELLOW="\033[38;5;220m"
    COLOR_CYAN="\033[38;5;75m"
    COLOR_GREEN="\033[38;5;78m"
    COLOR_RED="\033[38;5;203m"
    COLOR_MAGENTA="\033[38;5;176m"
  else
    COLOR_RESET=""
    COLOR_BOLD=""
    COLOR_DIM=""
    COLOR_YELLOW=""
    COLOR_CYAN=""
    COLOR_GREEN=""
    COLOR_RED=""
    COLOR_MAGENTA=""
  fi
}

setup_colors

REPO="raillen/daisy-file-manager"
DEFAULT_INSTALL_DIR="${HOME}/.local/bin"
DESKTOP_DIR="${HOME}/.local/share/applications"
ICONS_DIR="${HOME}/.local/share/icons/hicolor/scalable/apps"

print_banner() {
  printf "\n"
  printf "  ${COLOR_YELLOW}${COLOR_BOLD}🌼 DAISY FILE MANAGER${COLOR_RESET} — Instalador Interativo\n"
  printf "  ${COLOR_DIM}Gerenciador de arquivos TUI elegante estilo Nautilus${COLOR_RESET}\n"
  printf "  ${COLOR_CYAN}https://github.com/%s${COLOR_RESET}\n" "$REPO"
  printf "\n"
}

info() {
  printf "  ${COLOR_CYAN}ℹ${COLOR_RESET} %s\n" "$1"
}

success() {
  printf "  ${COLOR_GREEN}✓${COLOR_RESET} %s\n" "$1"
}

warn() {
  printf "  ${COLOR_YELLOW}⚠${COLOR_RESET} %s\n" "$1"
}

error() {
  printf "  ${COLOR_RED}✗ Erro:${COLOR_RESET} %s\n" "$1" >&2
}

die() {
  error "$1"
  exit 1
}

# Inicializa acesso a TTY para suportar modo interativo mesmo quando executado via curl | bash
TTY_FD=""
init_tty() {
  if [ -t 0 ]; then
    TTY_FD="0"
  elif [ -c /dev/tty ] && exec 3</dev/tty 2>/dev/null; then
    TTY_FD="3"
  else
    TTY_FD=""
  fi
}

read_input() {
  local prompt_text="$1"
  local target_var="$2"
  local default_value="$3"

  if [ -n "$TTY_FD" ]; then
    printf "%s" "$prompt_text"
    if [ "$TTY_FD" = "0" ]; then
      read -r input_val || input_val=""
    else
      read -r input_val <&3 || input_val=""
    fi
    if [ -z "$input_val" ]; then
      eval "$target_var=\"$default_value\""
    else
      eval "$target_var=\"$input_val\""
    fi
  else
    eval "$target_var=\"$default_value\""
  fi
}

# Detecção do Sistema Operacional e Arquitetura
detect_system() {
  OS="$(uname -s)"
  ARCH="$(uname -m)"

  if [ "$OS" != "Linux" ]; then
    die "O instalador oficial atualmente suporta apenas sistemas Linux. (Detectado: $OS)"
  fi

  case "$ARCH" in
    x86_64|amd64)
      ARCH="x86_64"
      ;;
    *)
      die "Arquitetura '$ARCH' ainda não possui binários pré-compilados nesta release (apenas x86_64)."
      ;;
  esac

  # Detecção de C-Library (glibc vs musl)
  LIBC="glibc"
  if ldd --version 2>&1 | grep -iq "musl" || ls /lib/ld-musl* >/dev/null 2>&1; then
    LIBC="musl"
  fi

  # Detecção de Distribuição Linux
  DISTRO_ID="unknown"
  DISTRO_NAME="Linux Genérico"
  NATIVE_FORMAT="none"

  if [ -f /etc/os-release ]; then
    # shellcheck disable=SC1091
    . /etc/os-release
    DISTRO_ID="${ID:-unknown}"
    DISTRO_NAME="${NAME:-Linux}"
    
    case "$DISTRO_ID" in
      arch|manjaro|endeavouros|garuda|artix)
        NATIVE_FORMAT="arch"
        ;;
      debian|ubuntu|pop|linuxmint|elementary|zorin|kali)
        NATIVE_FORMAT="debian"
        ;;
      fedora|rhel|centos|rocky|almalinux)
        NATIVE_FORMAT="fedora"
        ;;
      *)
        if echo "${ID_LIKE:-}" | grep -q "arch"; then
          NATIVE_FORMAT="arch"
        elif echo "${ID_LIKE:-}" | grep -q "debian\|ubuntu"; then
          NATIVE_FORMAT="debian"
        elif echo "${ID_LIKE:-}" | grep -q "fedora\|rhel"; then
          NATIVE_FORMAT="fedora"
        fi
        ;;
    esac
  fi
}

# Baixar conteúdo via curl ou wget
fetch_url() {
  local url="$1"
  local output="$2"

  if command -v curl >/dev/null 2>&1; then
    if [ -n "$output" ]; then
      curl -fsSL "$url" -o "$output"
    else
      curl -fsSL "$url"
    fi
  elif command -v wget >/dev/null 2>&1; then
    if [ -n "$output" ]; then
      wget -qO "$output" "$url"
    else
      wget -qO- "$url"
    fi
  else
    die "curl ou wget é necessário para baixar arquivos."
  fi
}

# Obter versões disponíveis no repositório GitHub
get_available_versions() {
  local versions=""
  
  # 1. Tentar via GitHub API
  local api_url="https://api.github.com/repos/${REPO}/releases"
  local json
  json=$(fetch_url "$api_url" "" 2>/dev/null || true)
  if [ -n "$json" ]; then
    versions=$(echo "$json" | grep -o '"tag_name": *"[^"]*"' | sed 's/"tag_name": *"//;s/"//' || true)
  fi

  # 2. Se falhar (rate limit da API), tentar via git ls-remote se git estiver instalado
  if [ -z "$versions" ] && command -v git >/dev/null 2>&1; then
    versions=$(git ls-remote --tags --refs "https://github.com/${REPO}.git" 2>/dev/null | awk -F'/' '{print $3}' || true)
  fi

  # 3. Fallback estático
  if [ -z "$versions" ]; then
    versions="v0.1.0"
  fi

  echo "$versions"
}

# Escolha da Versão
select_version() {
  local raw_versions
  raw_versions=$(get_available_versions)
  
  # Converter para array
  VERSION_LIST=()
  while IFS= read -r line; do
    [ -n "$line" ] && VERSION_LIST+=("$line")
  done <<< "$raw_versions"

  if [ ${#VERSION_LIST[@]} -eq 0 ]; then
    VERSION_LIST=("v0.1.0")
  fi

  # Se passada por variável de ambiente ou flag CLI, respeitar
  if [ -n "${DAISY_VERSION:-}" ]; then
    CHOSEN_VERSION="$DAISY_VERSION"
    info "Versão solicitada: ${COLOR_BOLD}${CHOSEN_VERSION}${COLOR_RESET}"
    return
  fi

  # Se não for interativo, usar a primeira (mais recente)
  if [ -z "$TTY_FD" ] || [ "${ASSUME_YES:-0}" -eq 1 ]; then
    CHOSEN_VERSION="${VERSION_LIST[0]}"
    info "Modo não interativo: selecionando versão mais recente (${COLOR_BOLD}${CHOSEN_VERSION}${COLOR_RESET})"
    return
  fi

  printf "  ${COLOR_BOLD}📦 Escolha a versão que deseja instalar:${COLOR_RESET}\n"
  local i=1
  for ver in "${VERSION_LIST[@]}"; do
    if [ $i -eq 1 ]; then
      printf "    ${COLOR_CYAN}[%d]${COLOR_RESET} %s ${COLOR_GREEN}(mais recente / recomendado)${COLOR_RESET}\n" "$i" "$ver"
    else
      printf "    ${COLOR_CYAN}[%d]${COLOR_RESET} %s\n" "$i" "$ver"
    fi
    ((i++))
  done
  printf "    ${COLOR_CYAN}[%d]${COLOR_RESET} Informar outra versão/tag manualmente\n" "$i"
  printf "\n"

  local choice=""
  read_input "  Digite sua escolha [1]: " choice "1"

  if [ "$choice" -ge 1 ] && [ "$choice" -le "${#VERSION_LIST[@]}" ] 2>/dev/null; then
    local idx=$((choice - 1))
    CHOSEN_VERSION="${VERSION_LIST[$idx]}"
  elif [ "$choice" -eq "$i" ] 2>/dev/null; then
    local custom_tag=""
    read_input "  Digite o nome da tag (ex: v0.1.0): " custom_tag "${VERSION_LIST[0]}"
    CHOSEN_VERSION="$custom_tag"
  else
    CHOSEN_VERSION="${VERSION_LIST[0]}"
  fi

  printf "\n"
  info "Versão selecionada: ${COLOR_BOLD}${CHOSEN_VERSION}${COLOR_RESET}"
}

# Escolha do Formato / Método de Instalação
select_format() {
  # Se passado via variável ou argumento
  if [ -n "${DAISY_FORMAT:-}" ]; then
    CHOSEN_FORMAT="$DAISY_FORMAT"
    info "Formato solicitado: ${COLOR_BOLD}${CHOSEN_FORMAT}${COLOR_RESET}"
    return
  fi

  # Se não for interativo ou assume-yes
  if [ -z "$TTY_FD" ] || [ "${ASSUME_YES:-0}" -eq 1 ]; then
    CHOSEN_FORMAT="binary"
    info "Modo não interativo: selecionando formato Binário Standalone"
    return
  fi

  printf "  ${COLOR_BOLD}🛠️  Distribuição detectada: ${COLOR_MAGENTA}%s${COLOR_RESET} (${ARCH})\n" "$DISTRO_NAME"
  printf "  ${COLOR_BOLD}Selecione o formato de pacote desejado:${COLOR_RESET}\n"
  printf "    ${COLOR_CYAN}[1]${COLOR_RESET} Binário Standalone ${COLOR_GREEN}[Recomendado]${COLOR_RESET} ${COLOR_DIM}(rápido, sem root, instala em ~/.local/bin)${COLOR_RESET}\n"
  
  case "$NATIVE_FORMAT" in
    arch)
      printf "    ${COLOR_CYAN}[2]${COLOR_RESET} Pacote Nativo Arch Linux ${COLOR_DIM}(.pkg.tar.zst via pacman)${COLOR_RESET}\n"
      ;;
    debian)
      printf "    ${COLOR_CYAN}[2]${COLOR_RESET} Pacote Nativo Debian/Ubuntu ${COLOR_DIM}(.deb via apt)${COLOR_RESET}\n"
      ;;
    fedora)
      printf "    ${COLOR_CYAN}[2]${COLOR_RESET} Pacote Nativo Fedora/RHEL ${COLOR_DIM}(.rpm via dnf)${COLOR_RESET}\n"
      ;;
    *)
      printf "    ${COLOR_CYAN}[2]${COLOR_RESET} Pacote Nativo ${COLOR_DIM}(não detectado automaticamente para sua distro)${COLOR_RESET}\n"
      ;;
  esac

  printf "    ${COLOR_CYAN}[3]${COLOR_RESET} AppImage portátil ${COLOR_DIM}(arquivo único executável)${COLOR_RESET}\n"
  printf "    ${COLOR_CYAN}[4]${COLOR_RESET} Flatpak Bundle ${COLOR_DIM}(.flatpak via flatpak install)${COLOR_RESET}\n"
  printf "\n"

  local choice=""
  read_input "  Digite sua escolha [1]: " choice "1"

  case "$choice" in
    2)
      if [ "$NATIVE_FORMAT" != "none" ]; then
        CHOSEN_FORMAT="native"
      else
        warn "Pacote nativo não suportado para esta distribuição. Utilizando Binário Standalone."
        CHOSEN_FORMAT="binary"
      fi
      ;;
    3)
      CHOSEN_FORMAT="appimage"
      ;;
    4)
      CHOSEN_FORMAT="flatpak"
      ;;
    *)
      CHOSEN_FORMAT="binary"
      ;;
  esac

  printf "\n"
  info "Formato selecionado: ${COLOR_BOLD}${CHOSEN_FORMAT}${COLOR_RESET}"
}

# Download e Instalação
install_daisy() {
  local clean_version="${CHOSEN_VERSION#v}"
  local temp_dir
  temp_dir=$(mktemp -d -t daisy-install-XXXXXX)
  
  # Limpeza ao sair
  trap 'rm -rf "$temp_dir"' EXIT

  local asset_name=""
  case "$CHOSEN_FORMAT" in
    binary)
      if [ "$LIBC" = "musl" ]; then
        asset_name="daisy-${CHOSEN_VERSION}-linux-x64-musl.tar.gz"
      else
        asset_name="daisy-${CHOSEN_VERSION}-linux-x64.tar.gz"
      fi
      ;;
    native)
      case "$NATIVE_FORMAT" in
        arch)
          asset_name="daisy-file-manager-${clean_version}-1-x86_64.pkg.tar.zst"
          ;;
        debian)
          asset_name="daisy_${clean_version}_amd64.deb"
          ;;
        fedora)
          asset_name="daisy-${clean_version}-1.x86_64.rpm"
          ;;
        *)
          die "Distribuição não suportada para pacote nativo."
          ;;
      esac
      ;;
    appimage)
      asset_name="Daisy-File-Manager-${clean_version}-x86_64.AppImage"
      ;;
    flatpak)
      asset_name="daisy-file-manager-${clean_version}-x86_64.flatpak"
      ;;
  esac

  local download_url="https://github.com/${REPO}/releases/download/${CHOSEN_VERSION}/${asset_name}"
  local checksums_url="https://github.com/${REPO}/releases/download/${CHOSEN_VERSION}/SHA256SUMS.txt"

  info "Baixando ${COLOR_BOLD}${asset_name}${COLOR_RESET}..."
  fetch_url "$download_url" "${temp_dir}/${asset_name}" || die "Falha ao baixar '${asset_name}' de $download_url"

  # Verificação de Checksum SHA256 se disponível
  info "Verificando integridade SHA-256..."
  if fetch_url "$checksums_url" "${temp_dir}/SHA256SUMS.txt" 2>/dev/null; then
    local expected_hash
    expected_hash=$(grep "${asset_name}" "${temp_dir}/SHA256SUMS.txt" | awk '{print $1}')
    if [ -n "$expected_hash" ]; then
      local actual_hash
      actual_hash=$(sha256sum "${temp_dir}/${asset_name}" | awk '{print $1}')
      if [ "$expected_hash" = "$actual_hash" ]; then
        success "Integridade verificada com sucesso (SHA-256: ${actual_hash:0:16}...)"
      else
        die "Falha na verificação de integridade! Hash esperado: $expected_hash, recebido: $actual_hash"
      fi
    else
      warn "Assinatura do arquivo não encontrada em SHA256SUMS.txt. Prosseguindo..."
    fi
  else
    warn "SHA256SUMS.txt não encontrado na release. Prosseguindo sem verificação de hash."
  fi

  # Instalar de acordo com o formato
  printf "\n"
  case "$CHOSEN_FORMAT" in
    binary)
      install_binary "$temp_dir" "$asset_name"
      ;;
    native)
      install_native "$temp_dir" "$asset_name"
      ;;
    appimage)
      install_appimage "$temp_dir" "$asset_name"
      ;;
    flatpak)
      install_flatpak "$temp_dir" "$asset_name"
      ;;
  esac
}

install_desktop_integration() {
  local target_bin="$1"
  info "Configurando atalho no menu de aplicativos (.desktop) e ícone..."

  mkdir -p "$DESKTOP_DIR" "$ICONS_DIR"

  # Baixar ou gerar ícone SVG
  local icon_url="https://raw.githubusercontent.com/${REPO}/main/assets/daisy.svg"
  fetch_url "$icon_url" "${ICONS_DIR}/daisy-files.svg" 2>/dev/null || true

  # Gerar .desktop
  cat <<EOF > "${DESKTOP_DIR}/daisy-files.desktop"
[Desktop Entry]
Name=Daisy File Manager
Comment=Nautilus-style TUI File Manager built with OpenTUI and Solid.js
Exec=${target_bin} %F
Terminal=true
Type=Application
Icon=daisy-files
Categories=System;FileManager;Utility;Core;
Keywords=file;manager;explorer;browser;terminal;tui;nautilus;
EOF
  chmod 644 "${DESKTOP_DIR}/daisy-files.desktop"

  if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
  fi
}

install_binary() {
  local temp_dir="$1"
  local asset_name="$2"
  local install_dir="${CUSTOM_DIR:-$DEFAULT_INSTALL_DIR}"

  info "Extraindo pacote standalone..."
  tar -xzf "${temp_dir}/${asset_name}" -C "$temp_dir"

  local binary_src=""
  if [ -f "${temp_dir}/daisy-linux-x64" ]; then
    binary_src="${temp_dir}/daisy-linux-x64"
  elif [ -f "${temp_dir}/daisy-linux-x64-musl" ]; then
    binary_src="${temp_dir}/daisy-linux-x64-musl"
  elif [ -f "${temp_dir}/daisy" ]; then
    binary_src="${temp_dir}/daisy"
  else
    die "Binário executável não encontrado no pacote extraído."
  fi

  info "Instalando binário em ${COLOR_BOLD}${install_dir}/daisy-files${COLOR_RESET}..."
  mkdir -p "$install_dir"
  install -m 755 "$binary_src" "${install_dir}/daisy-files"

  install_desktop_integration "${install_dir}/daisy-files"
  success "Binário instalado com sucesso em ${install_dir}/daisy-files"

  # Verificar se está no PATH
  if ! echo "$PATH" | tr ':' '\n' | grep -qx "$install_dir"; then
    warn "Atenção: O diretório '${install_dir}' não está no seu \$PATH!"
    printf "    Para executar o Daisy digitando apenas 'daisy-files', adicione ao seu ~/.bashrc ou ~/.zshrc:\n"
    printf "    ${COLOR_CYAN}export PATH=\"%s:\$PATH\"${COLOR_RESET}\n\n" "$install_dir"
  fi
}

install_native() {
  local temp_dir="$1"
  local asset_name="$2"
  local pkg_path="${temp_dir}/${asset_name}"

  case "$NATIVE_FORMAT" in
    arch)
      info "Instalando pacote Arch Linux via pacman..."
      sudo pacman -U --noconfirm "$pkg_path"
      ;;
    debian)
      info "Instalando pacote Debian/Ubuntu via apt..."
      sudo apt install -y "$pkg_path" || sudo dpkg -i "$pkg_path"
      ;;
    fedora)
      info "Instalando pacote Fedora/RPM via dnf..."
      sudo dnf install -y "$pkg_path" || sudo rpm -Uvh "$pkg_path"
      ;;
  esac
  success "Pacote nativo instalado com sucesso no sistema!"
}

install_appimage() {
  local temp_dir="$1"
  local asset_name="$2"
  local install_dir="${CUSTOM_DIR:-$DEFAULT_INSTALL_DIR}"

  mkdir -p "$install_dir"
  info "Instalando AppImage em ${COLOR_BOLD}${install_dir}/daisy-files${COLOR_RESET}..."
  install -m 755 "${temp_dir}/${asset_name}" "${install_dir}/daisy-files"
  install_desktop_integration "${install_dir}/daisy-files"
  success "AppImage instalada com sucesso em ${install_dir}/daisy-files"

  if ! echo "$PATH" | tr ':' '\n' | grep -qx "$install_dir"; then
    warn "Atenção: O diretório '${install_dir}' não está no seu \$PATH!"
    printf "    Para executar o Daisy digitando apenas 'daisy-files', adicione ao seu ~/.bashrc ou ~/.zshrc:\n"
    printf "    ${COLOR_CYAN}export PATH=\"%s:\$PATH\"${COLOR_RESET}\n\n" "$install_dir"
  fi
}

install_flatpak() {
  local temp_dir="$1"
  local asset_name="$2"
  local bundle_path="${temp_dir}/${asset_name}"

  if ! command -v flatpak >/dev/null 2>&1; then
    die "O comando 'flatpak' não foi encontrado. Por favor, instale o Flatpak primeiro."
  fi

  info "Instalando Flatpak bundle..."
  flatpak install --user --bundle -y "$bundle_path"
  success "Flatpak instalado com sucesso!"
  info "Para executar via Flatpak: flatpak run org.daisy.FileManager"
}

uninstall_daisy() {
  info "Desinstalando Daisy File Manager..."
  local removed=0
  
  if [ -f "${DEFAULT_INSTALL_DIR}/daisy-files" ]; then
    rm -f "${DEFAULT_INSTALL_DIR}/daisy-files"
    info "Removido: ${DEFAULT_INSTALL_DIR}/daisy-files"
    removed=1
  fi

  if [ -f "${DESKTOP_DIR}/daisy-files.desktop" ]; then
    rm -f "${DESKTOP_DIR}/daisy-files.desktop"
    info "Removido: ${DESKTOP_DIR}/daisy-files.desktop"
    removed=1
  fi

  if [ -f "${ICONS_DIR}/daisy-files.svg" ]; then
    rm -f "${ICONS_DIR}/daisy-files.svg"
    info "Removido: ${ICONS_DIR}/daisy-files.svg"
    removed=1
  fi

  if [ $removed -eq 1 ]; then
    success "Daisy desinstalado com sucesso."
  else
    info "Nenhum arquivo de instalação standalone encontrado para desinstalar."
  fi
  exit 0
}

# Processamento de Argumentos CLI
parse_args() {
  while [ $# -gt 0 ]; do
    case "$1" in
      -v|--version)
        DAISY_VERSION="$2"
        shift 2
        ;;
      -f|--format)
        DAISY_FORMAT="$2"
        shift 2
        ;;
      -d|--dir)
        CUSTOM_DIR="$2"
        shift 2
        ;;
      -y|--yes)
        ASSUME_YES=1
        shift
        ;;
      --uninstall)
        uninstall_daisy
        ;;
      -h|--help)
        print_banner
        printf "Uso: curl -fsSL https://raw.githubusercontent.com/%s/main/install.sh | bash [OPÇÕES]\n\n" "$REPO"
        printf "Opções:\n"
        printf "  -v, --version <tag>    Instalar uma versão específica (ex: v0.1.0)\n"
        printf "  -f, --format <formato> Formato de instalação (binary, native, appimage, flatpak)\n"
        printf "  -d, --dir <caminho>    Diretório de instalação customizado (padrão: ~/.local/bin)\n"
        printf "  -y, --yes              Aceitar opções padrão sem perguntas interativas\n"
        printf "      --uninstall        Desinstalar o Daisy (remove apenas os arquivos do Daisy File Manager)\n"
        printf "  -h, --help             Exibir esta mensagem de ajuda\n\n"
        exit 0
        ;;
      *)
        shift
        ;;
    esac
  done
}

main() {
  parse_args "$@"
  init_tty
  print_banner
  detect_system
  select_version
  select_format
  install_daisy

  printf "\n"
  printf "  ${COLOR_GREEN}${COLOR_BOLD}🎉 Parabéns! Daisy File Manager (%s) instalado com sucesso!${COLOR_RESET}\n" "$CHOSEN_VERSION"
  printf "\n"
  printf "  ${COLOR_BOLD}Para iniciar agora:${COLOR_RESET}\n"
  printf "    ${COLOR_CYAN}daisy-files${COLOR_RESET}\n\n"
  printf "  ${COLOR_BOLD}Para abrir em uma pasta específica:${COLOR_RESET}\n"
  printf "    ${COLOR_CYAN}daisy-files ~/Documentos${COLOR_RESET}\n\n"
  printf "  ${COLOR_BOLD}Dicas de uso:${COLOR_RESET}\n"
  printf "    • Pressione ${COLOR_YELLOW}?${COLOR_RESET} para abrir o menu de ajuda e atalhos\n"
  printf "    • Pressione ${COLOR_YELLOW}F3${COLOR_RESET} para ativar a divisão de painéis (Split-Pane)\n"
  printf "    • Pressione ${COLOR_YELLOW}v${COLOR_RESET} para alternar entre lista e grade\n"
  printf "    • Clique com o ${COLOR_YELLOW}botão direito do mouse${COLOR_RESET} para o menu de ações\n"
  printf "\n"
}

main "$@"
