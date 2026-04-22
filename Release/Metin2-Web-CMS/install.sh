#!/usr/bin/env bash

# Metin2 Web - Server Dependency Installer
# Supports: Ubuntu, Debian, FreeBSD
# Checks for: Node.js (18+), npm, pm2

echo "==============================================="
echo "   Metin2 Web Server Setup & Dependency Check"
echo "==============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Please run as root (or with sudo) to allow package installation.${NC}"
  # Informational, won't exit immediately so they can just check dependencies
fi

# Detect OS
OS_NAME=$(uname -s)
OS_DISTRO=""
PACKAGE_MANAGER=""
INSTALL_CMD=""

if [ "$OS_NAME" = "Linux" ]; then
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS_DISTRO=$ID
    fi
    
    if [[ "$OS_DISTRO" == "ubuntu" ]] || [[ "$OS_DISTRO" == "debian" ]]; then
        PACKAGE_MANAGER="apt-get"
        INSTALL_CMD="apt-get update && apt-get install -y"
        echo -e "Detected OS: ${GREEN}Ubuntu / Debian${NC}"
    else
        echo -e "${RED}Unsupported Linux distribution: $OS_DISTRO. Only Ubuntu/Debian are officially supported.${NC}"
        PACKAGE_MANAGER="unknown"
    fi
elif [ "$OS_NAME" = "FreeBSD" ]; then
    PACKAGE_MANAGER="pkg"
    INSTALL_CMD="pkg update && pkg install -y"
    echo -e "Detected OS: ${GREEN}FreeBSD${NC}"
else
    echo -e "${RED}Unsupported Operating System: $OS_NAME${NC}"
    PACKAGE_MANAGER="unknown"
fi

echo "-----------------------------------------------"

# Dependency Check Flags
MISSING_NODE=0
MISSING_NPM=0
MISSING_PM2=0

# Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VER=$(node -v)
    echo -e "Node.js: ${GREEN}Installed ($NODE_VER)${NC}"
else
    echo -e "Node.js: ${RED}Missing${NC}"
    MISSING_NODE=1
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    NPM_VER=$(npm -v)
    echo -e "NPM:     ${GREEN}Installed (v$NPM_VER)${NC}"
else
    echo -e "NPM:     ${RED}Missing${NC}"
    MISSING_NPM=1
fi

# Check PM2
if command -v pm2 >/dev/null 2>&1; then
    PM2_VER=$(pm2 -v)
    echo -e "PM2:     ${GREEN}Installed (v$PM2_VER)${NC}"
else
    echo -e "PM2:     ${RED}Missing (Used to run the website in the background)${NC}"
    MISSING_PM2=1
fi

echo "-----------------------------------------------"

TOTAL_MISSING=$((MISSING_NODE + MISSING_NPM + MISSING_PM2))

if [ $TOTAL_MISSING -eq 0 ]; then
    echo -e "${GREEN}All required dependencies are installed! You are ready to start the server.${NC}"
    echo "To start the website: pm2 start server.js --name metin2-web"
    exit 0
fi

if [ "$PACKAGE_MANAGER" = "unknown" ]; then
    echo -e "${YELLOW}Cannot automatically install on this OS. Please install Node.js (18+), npm, and pm2 manually.${NC}"
    exit 1
fi

echo -e "You are missing ${RED}$TOTAL_MISSING${NC} dependency(ies)."
echo -n "Would you like to install them automatically now? [y/N]: "
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}Error: Automatic installation requires root privileges. Please re-run with sudo.${NC}"
        exit 1
    fi

    echo "Starting installation..."
    
    # OS Specific Node.js Installation
    if [ $MISSING_NODE -eq 1 ] || [ $MISSING_NPM -eq 1 ]; then
        echo -e "${YELLOW}Installing Node.js & NPM...${NC}"
        if [ "$PACKAGE_MANAGER" = "apt-get" ]; then
            # NodeSource standard for Ubuntu/Debian (Node 20 default)
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            $INSTALL_CMD nodejs
        elif [ "$PACKAGE_MANAGER" = "pkg" ]; then
            # FreeBSD uses specific package names for Node.js and NPM
            $INSTALL_CMD node20 npm-node20
            # Ensure binaries are available in current session Path
            [ -f /usr/local/bin/node ] && alias node='/usr/local/bin/node'
            [ -f /usr/local/bin/npm ] && alias npm='/usr/local/bin/npm'
        fi
    fi

    # Global Package Installation (PM2)
    if [ $MISSING_PM2 -eq 1 ]; then
        echo -e "${YELLOW}Installing PM2 Globally...${NC}"
        # Final check if npm is available
        if ! command -v npm >/dev/null 2>&1; then
            if [ -f /usr/local/bin/npm ]; then
                /usr/local/bin/npm install -g pm2
            else
                echo -e "${RED}Error: npm could not be found even after installation. Please check your PATH.${NC}"
                exit 1
            fi
        else
            npm install -g pm2
        fi
    fi
    
    echo -e "${GREEN}Installation routine completed!${NC}"
    echo -e "Please re-run ${YELLOW}./install.sh${NC} to verify everything is set up correctly."
else
    echo -e "Installation cancelled by user."
    echo -e "Required commands if you want to install manually:"
    if [ "$PACKAGE_MANAGER" = "apt-get" ]; then
        echo " - Node.js/NPM: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash - && sudo apt-get install -y nodejs"
        echo " - PM2: sudo npm install -g pm2"
    elif [ "$PACKAGE_MANAGER" = "pkg" ]; then
        echo " - Node.js/NPM: sudo pkg install node20 npm-node20"
        echo " - PM2: sudo npm install -g pm2"
    fi
fi
