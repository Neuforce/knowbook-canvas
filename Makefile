# Knowbook Canvas - Development Makefile
# Following industry best practices for git workflow management

.PHONY: help install build dev test lint clean branch feature hotfix release

# Default target
help: ## Show this help message
	@echo "Knowbook Canvas Development Commands"
	@echo "===================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development Setup
install: ## Install all dependencies
	@echo "Installing dependencies..."
	yarn install

build: ## Build the application
	@echo "Building application..."
	yarn build

dev: ## Start development servers (both web and agents)
	@echo "Starting development servers..."
	@echo "Starting LangGraph server..."
	@cd apps/agents && yarn dev &
	@sleep 5
	@echo "Starting web server..."
	@cd apps/web && yarn dev

dev-web: ## Start only the web development server
	@echo "Starting web development server..."
	@cd apps/web && yarn dev

dev-agents: ## Start only the agents development server
	@echo "Starting LangGraph agents server..."
	@cd apps/agents && yarn dev

# Code Quality
lint: ## Run linting
	@echo "Running linters..."
	yarn lint

lint-fix: ## Fix linting issues
	@echo "Fixing linting issues..."
	yarn lint:fix

test: ## Run tests
	@echo "Running tests..."
	yarn test

# Git Workflow Commands
branch: ## Create a new feature branch (usage: make branch name=KB-C-01-feature-name)
	@if [ -z "$(name)" ]; then \
		echo "Error: Please provide a branch name. Usage: make branch name=KB-C-01-feature-name"; \
		exit 1; \
	fi
	@echo "Creating feature branch: feature/$(name)"
	@git checkout main
	@git pull origin main
	@git checkout -b feature/$(name)
	@echo "✅ Created and switched to branch: feature/$(name)"

feature: branch ## Alias for branch command

hotfix: ## Create a hotfix branch (usage: make hotfix name=fix-critical-issue)
	@if [ -z "$(name)" ]; then \
		echo "Error: Please provide a hotfix name. Usage: make hotfix name=fix-critical-issue"; \
		exit 1; \
	fi
	@echo "Creating hotfix branch: hotfix/$(name)"
	@git checkout main
	@git pull origin main
	@git checkout -b hotfix/$(name)
	@echo "✅ Created and switched to branch: hotfix/$(name)"

commit: ## Commit changes with conventional commit format (usage: make commit msg="feat: add new feature")
	@if [ -z "$(msg)" ]; then \
		echo "Error: Please provide a commit message. Usage: make commit msg=\"feat: add new feature\""; \
		exit 1; \
	fi
	@git add .
	@git commit -m "$(msg)"
	@echo "✅ Committed changes: $(msg)"

push: ## Push current branch to origin
	@branch=$$(git branch --show-current); \
	echo "Pushing branch: $$branch"; \
	git push -u origin $$branch
	@echo "✅ Pushed branch to origin"

pr-ready: ## Prepare branch for PR (lint, test, push)
	@echo "Preparing branch for PR..."
	@make lint
	@make build
	@make push
	@echo "✅ Branch is ready for PR"

merge-main: ## Merge latest main into current branch
	@branch=$$(git branch --show-current); \
	echo "Merging main into: $$branch"; \
	git fetch origin main; \
	git merge origin/main
	@echo "✅ Merged main into current branch"

# Cleanup
clean: ## Clean build artifacts and node_modules
	@echo "Cleaning build artifacts..."
	@find . -name "node_modules" -type d -prune -exec rm -rf {} +
	@find . -name ".next" -type d -prune -exec rm -rf {} +
	@find . -name "dist" -type d -prune -exec rm -rf {} +
	@find . -name ".turbo" -type d -prune -exec rm -rf {} +
	@echo "✅ Cleaned build artifacts"

# Project Status
status: ## Show git and project status
	@echo "Git Status:"
	@echo "==========="
	@git status --short
	@echo ""
	@echo "Current Branch:"
	@echo "==============="
	@git branch --show-current
	@echo ""
	@echo "Recent Commits:"
	@echo "==============="
	@git log --oneline -5

# Development workflow example:
# 1. make branch name=KB-C-01-update-branding
# 2. # Make your changes
# 3. make commit msg="feat(branding): update Open Canvas to Knowbook branding"
# 4. make pr-ready
